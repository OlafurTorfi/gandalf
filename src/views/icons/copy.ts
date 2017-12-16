export const createCopy = m =>
    m(
        'svg',
        {
            height: '24',
            viewBox: '0 0 24 24',
            width: '24',
        },
        [
            m('rect', {
                fill: 'none',
                height: '13',
                rx: '2',
                ry: '2',
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round',
                'stroke-width': '2',
                width: '13',
                x: '9',
                y: '9',
            }),
            m('path', {
                d: 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1',
                fill: 'none',
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round',
                'stroke-width': '2',
            }),
        ]
    )
