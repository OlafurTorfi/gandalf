exports.createIdGenerator = function () {
  var i = 0;
  return function () {
    i++;
    return 'e' + i;
  };
};
exports.createId = exports.createIdGenerator();
exports.createPopupmenu = function(pubsub, controller) {
  'use strict';
  var searchValue = m.prop(''),
    selectedIndex = m.prop(0),
    menuId = exports.createId(),
    show = m.prop(false),
    toggleShow = function() {
      m.startComputation();
      show(!show());
      searchValue('');
      selectedIndex(0);
      m.endComputation();
      if (show() && searchElement) {
        setTimeout(function(){searchElement.focus();}, 1);
      }
    },
    config = function(el) {
      searchElement = el;
    },
    keyDown = function(e) {
      var l = getList().length,
        i = selectedIndex();
      if (e.keyCode === 40 && l > 0) {
        selectedIndex((i + 1) % l);
        document.getElementById(menuId + '-i' + selectedIndex()).scrollIntoViewIfNeeded();
      } else if (e.keyCode === 38 && l > 0) {
        selectedIndex((i - 1 + l) % l);
        document.getElementById(menuId + '-i' + selectedIndex()).scrollIntoViewIfNeeded();
      } else if (e.keyCode === 27) {
        toggleShow();
        pubsub.emit('editor-focus', {});
      }
      if(controller.keyDown) {
        controller.keyDown(e, getList()[selectedIndex()]);
      }
    },
    getList = function() {
      return controller.getList().filter(function(item) {
        return item.name.toLowerCase().indexOf(searchValue().toLowerCase()) !== -1;
      });
    },
    keyUp = function(e) {
      var list = getList();
      if (e.keyCode === 13 && list.length) {
        controller.itemSelected(list[selectedIndex()]);
        toggleShow();
      }
    },
    searchElement;
  return {
  	toggleShow: toggleShow,
    controller: controller,
    keyDown: keyDown,
    keyUp: keyUp,
    view: function() {
      return m('div', {
        'class': 'p-menu popup' + (show() ? '' : ' hidden')
      }, [
        m('input', {
          'class': 'p-menu-search',
          config: config,
          value: searchValue(),
          oninput: m.withAttr('value', searchValue),
          onkeydown: keyDown,
          onkeyup: keyUp
        }),
        m('ul', {
          'class': 'p-menu-list'
        }, getList().map(function(item, index) {
          return m('li', {
            'class': 'p-menu-item' + (index === selectedIndex() ? ' p-menu-item-selected' : ''),
            'id': menuId + '-i' + index
          }, controller.renderItem ? controller.renderItem(item) : item.name);
        }))
      ]);
    }
  };
};