import { createWriteStream } from 'fs'
import * as JSONStream from 'JSONStream'
import { Database } from 'sqlite3'
import { Readable } from 'stream'
import { createGroupTablesTransform } from '../export-schema'
import { IConnectionInfo } from '../settings'
import { IClientConnection, IMoreBuffer } from './types'

const bufferSize = 100

export const connect = async (
    _options,
    settings: IConnectionInfo
): Promise<IClientConnection> => {
    const createClient = async () => {
        return new Promise<Database>((resolve, reject) => {
            const db = new Database(settings.database || settings.host, err => {
                if (err) {
                    reject(err)
                } else {
                    resolve(db)
                }
            })
        })
    }

    let client: Database = await createClient()
    let isAutoCommitEnabled = settings.autoCommit !== false

    if (!isAutoCommitEnabled) {
        await new Promise<void>((resolve, reject) => {
            client.run('BEGIN TRANSACTION', err => {
                if (err) reject(err)
                else resolve()
            })
        })
    }

    return {
        settings: () => settings,
        execute: async statement => {
            return new Promise((resolve, reject) => {
                const isQuery = /^\s*(SELECT|PRAGMA|SHOW)/i.test(statement)

                if (isQuery) {
                    client.all(statement, (err, rows: any[]) => {
                        if (err) {
                            reject(err)
                            return
                        }

                        const columns =
                            rows.length > 0
                                ? Object.keys(rows[0]).map(name => ({
                                      name,
                                      precision: 1000,
                                  }))
                                : []

                        let offset = 0
                        const createQueryFun = (): (() => Promise<
                            IMoreBuffer
                        >) => {
                            return async (): Promise<IMoreBuffer> => {
                                const data = rows
                                    .slice(offset, offset + bufferSize)
                                    .map(row => Object.values(row).map(String))
                                offset += bufferSize
                                return {
                                    data,
                                    more:
                                        offset < rows.length
                                            ? createQueryFun()
                                            : undefined,
                                }
                            }
                        }

                        resolve({
                            isQuery: () => true,
                            metadata: async () => columns,
                            updated: async () => 0,
                            query: createQueryFun(),
                        })
                    })
                } else {
                    client.run(statement, function(err) {
                        if (err) {
                            reject(err)
                            return
                        }

                        resolve({
                            isQuery: () => false,
                            metadata: async () => [],
                            updated: async () => this.changes,
                            query: async () => ({ data: [] }),
                        })
                    })
                }
            })
        },
        isAutoCommit: () => isAutoCommitEnabled,
        commit: async () => {
            if (!isAutoCommitEnabled) {
                await new Promise<void>((resolve, reject) => {
                    client.run('COMMIT', err => {
                        if (err) reject(err)
                        else resolve()
                    })
                })
                await new Promise<void>((resolve, reject) => {
                    client.run('BEGIN TRANSACTION', err => {
                        if (err) reject(err)
                        else resolve()
                    })
                })
            }
        },
        rollback: async () => {
            if (!isAutoCommitEnabled) {
                await new Promise<void>((resolve, reject) => {
                    client.run('ROLLBACK', err => {
                        if (err) reject(err)
                        else resolve()
                    })
                })
                await new Promise<void>((resolve, reject) => {
                    client.run('BEGIN TRANSACTION', err => {
                        if (err) reject(err)
                        else resolve()
                    })
                })
            }
        },
        close: () => {
            client.close()
        },
        exportSchemaToFile: ({ pubsub, file }: any) => {
            const sql = `
                SELECT 
                    m.name as TABLE_NAME,
                    'main' as TABLE_SCHEMA,
                    '' as TABLE_TEXT,
                    m.type as TABLE_TYPE,
                    p.name as COLUMN_NAME,
                    '' as COLUMN_TEXT,
                    p.type as DATA_TYPE,
                    0 as LENGTH,
                    0 as NUMERIC_SCALE
                FROM sqlite_master m
                LEFT JOIN pragma_table_info(m.name) p
                WHERE m.type IN ('table', 'view')
                ORDER BY m.name, p.cid
            `
            const handleError = err => pubsub.emit('export-error', err)
            const stream = new Readable({ objectMode: true })
            stream._read = () => {
                // noop
            }

            client.all(sql, (err, rows: any[]) => {
                if (err) {
                    handleError(err)
                } else {
                    rows.forEach(row =>
                        stream.push(Object.values(row).map(String))
                    )
                    stream.push(null)
                }
            })

            return stream
                .pipe(createGroupTablesTransform(pubsub))
                .on('error', handleError)
                .pipe(JSONStream.stringify())
                .on('error', handleError)
                .on('end', () => console.log('end json stringify'))
                .pipe(createWriteStream(file))
                .on('end', () => console.log('end write'))
                .on('error', handleError)
        },
    }
}
