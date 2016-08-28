'use babel';

const CompositeDisposable = require('atom').CompositeDisposable;
const Diagram = require('node-sequence-diagram');
const Disposable = require('atom').Disposable;
const Emitter = require('atom').Emitter;
const Fs = require('fs');
const Path = require('path');
const ScrollView = require('atom-space-pen-views').ScrollView;
const Url = require('url');

const CSS = `
svg text {
  fill: #000;
  stroke: none;
  font-size: 12pt;
  font-family: 'Andale Mono', monospace;
}

svg :not(text) {
  fill: none;
  stroke: #000;
  stroke-width: 2;
}

.textbg {
  fill: #fff;
  stroke: none;
}

.rect {
  fill: #fff;
}

.signal-solid {
  stroke-dasharray: 0;
}

.signal-dotted {
  stroke-dasharray: 5;
}

.arrow-filled {
  marker-end: url(#arrow-filled);
}

.arrow-open {
  marker-end: url(#arrow-open);
}
`;

class DiagramView extends ScrollView {
  static content() {
    // Magic required to enable scrolling and keyboard shortcuts for scrolling.
    return this.div({class: 'sequence-diagram-view', tabindex: -1});
  }

  constructor(url) {
    super();
    this.subscriptions_ = new CompositeDisposable();
    this.emitter_ = new Emitter();
    this.editor_ = this.findEditor_(Url.parse(url).hostname);
    this.title_ = this.editor_.getTitle() + ' - Diagram';
    this.url_ = url;
    this.child_ = null;
  }

  attached() {
    this.pane_ = atom.workspace.paneForURI(this.getURI());
    this.pane_.activateItem(this);

    const buffer = this.editor_.getBuffer();
    this.subscriptions_.add(buffer.onDidStopChanging(this.updateView_.bind(this)));
    this.subscriptions_.add(buffer.onDidSave(this.updateView_.bind(this)));
    this.subscriptions_.add(buffer.onDidReload(this.updateView_.bind(this)));

    this.updateView_();
  }

  export() {
    const editorFilename = this.editor_.getPath();
    const suggestedFilename = editorFilename.replace(Path.extname(editorFilename), '') + '.svg';
    const filename = atom.showSaveDialogSync(suggestedFilename);

    if (!filename) {
      return;
    }

    const svgContent = new XMLSerializer().serializeToString(this.child_);
    Fs.writeFileSync(filename, unescape(encodeURIComponent(svgContent)), { encoding: 'binary' });
  }

  findEditor_(editorId) {
    const allEditors = atom.workspace.getTextEditors();
    for (let i = 0; i < allEditors.length; ++i) {
      if (allEditors[i].id == editorId) {
        return allEditors[i];
      }
    }
    return null;
  }

  updateView_() {
    try {
      const scrollTop = this.element.scrollTop;
      const scrollLeft = this.element.scrollLeft;

      const diagram = Diagram.parse(this.editor_.getText());

      while (this.element.firstChild) {
        this.element.removeChild(this.element.firstChild);
      }

      const stylesheet = document.createElement('style');
      stylesheet.type = 'text/css';
      stylesheet.innerHTML = CSS;
      this.child_ = this.element.createShadowRoot();
      diagram.drawSVG(this.child_, stylesheet);

      this.element.scrollTop = scrollTop;
      this.element.scrollLeft = scrollLeft;
    } catch (e) {
      console.log(e);
    }
  }

  onDidChangeTitle(callback) {
    return this.emitter_.on('did-change-title', callback);
  }

  onDidChangeModified(callback) {
    return new Disposable();
  }

  // Required to find the pane for this instance.
  getURI() {
    return this.url_;
  }

  getTitle() {
    return this.title_;
  }
}

module.exports = DiagramView;
