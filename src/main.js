'use babel';

const CompositeDisposable = require('atom').CompositeDisposable;
const DiagramView = require('./diagram_view');
const Url = require('url');

class Application {
  constructor() {
    this.subscriptions_ = new CompositeDisposable();
  }

  activate() {
    this.subscriptions_.add(atom.commands.add('atom-workspace', { 'sequence-diagram:toggle': this.toggle_.bind(this) }));
    this.subscriptions_.add(atom.commands.add('atom-workspace', { 'sequence-diagram:export': this.export_.bind(this) }))
    this.subscriptions_.add(atom.workspace.addOpener(this.opener_.bind(this)));
  }

  deactivate() {
    this.subscriptions_.dispose();
  }

  toggle_() {
    if (atom.workspace.getActivePaneItem() instanceof DiagramView) {
      atom.workspace.destroyActivePaneItem();
      return;
    }

    const editor = atom.workspace.getActiveTextEditor();
    atom.workspace.open('sequence-diagram://' + editor.id, { split: 'right' });
  }

  export_() {
    atom.workspace.getActivePaneItem().export();
  }

  opener_(url) {
    if (Url.parse(url).protocol == 'sequence-diagram:') {
      return new DiagramView(url);
    }
  }
}

const instance = new Application();
module.exports = {
  config: {},

  activate: function() {
    instance.activate();
  },

  deactivate: function() {
    instance.deactivate();
  }
};
