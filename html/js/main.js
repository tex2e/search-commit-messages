
// - FilterableCommentTable
//   - LangTab
//   - SearchBar
//   - CommentTable
//     - CommentRow

RegExp.escape = function(string) {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
};

String.prototype.splice = function(idx, rem, str) {
  return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};

// To search, at least one charactor is necessary.
var MIN_SEARCH_CHARS = 1;

var CommentRow = React.createClass({
  render: function() {
    var comment = this.props.comment;
    var searchWords = this.props.match || [];
    var currentPos = 0;
    var boldBegin = "<b>";
    var boldEnd = "</b>";

    // change words into bold
    for (var i = 0; i < searchWords.length; i++) {
      var searchWord = searchWords[i];
      var pos = comment.toLowerCase().indexOf(searchWord, currentPos);
      comment = comment
        .splice(pos, 0, boldBegin) // insert <b>
        .splice(pos + boldBegin.length + searchWord.length, 0, boldEnd); // insert </b>
      currentPos = pos + boldBegin.length + searchWord.length + boldEnd.length; // update currentPos
    }

    return (
      <tr>
        <td dangerouslySetInnerHTML={{__html: comment}}></td>
      </tr>
    );
  }
});

function isMatched(str, words) {
  var currentPos = 0;
  for (var i = 0; i < words.length; i++) {
    var pos = str.toLowerCase().indexOf(words[i], currentPos);
    if (pos === -1) return false;
    currentPos = pos + words[i].length; // update currentPos
  }
  return true;
}

var CommentTable = React.createClass({
  addRowNum: function () {
    this.props.changeRowNum(
      this.props.maxRowNum + 100
    );
  },
  render: function () {
    var filterText = this.props.filterText
      .replace(/\s+/g, ' ') // squeeze whitespace
      .trim();              // strip
    if (filterText.length < MIN_SEARCH_CHARS) return (<table></table>);

    var searchWords = filterText.split(" ");
    var maxRowNum = this.props.maxRowNum;
    var rows =
      this.props.comments.filter(function (comment) {
        return isMatched(comment, searchWords);
      })
      .slice(0, maxRowNum)
      .map(function (comment) {
        return (<CommentRow comment={comment} key={comment} match={searchWords} />);
      });

    if (rows.length >= maxRowNum) {
      rows.push(
        <tr key="more...">
          <td><button className="btn btn-default" onClick={this.addRowNum}>more...</button></td>
        </tr>
      );
    }

    return (
      <table className="table">
        <tbody>
          {rows}
        </tbody>
      </table>
    );
  }
});

var SearchBar = React.createClass({
  handleUserInput: function() {
    this.props.onUserInput(
      this.refs.filterTextInput.value
    );
  },
  render: function () {
    return (
      <input
        type="text"
        className="form-control"
        placeholder="Search..."
        value={this.props.filterText}
        ref="filterTextInput"
        onChange={this.handleUserInput}
      />
    );
  }
});

var FilterableCommentTable = React.createClass({
  getInitialState: function () {
    return {
      filterText: '',
      maxRowNum: 100
    };
  },
  handleUserInput: function (filterText) {
    this.setState({ filterText: filterText, maxRowNum: 100 });
  },
  changeMaxRowNum: function (maxRowNum) {
    this.setState({ maxRowNum: maxRowNum });
  },
  render: function () {
    return (
      <div>
        <SearchBar
          filterText={this.state.filterText}
          onUserInput={this.handleUserInput}
        />
        <CommentTable
          comments={this.props.comments}
          filterText={this.state.filterText}
          maxRowNum={this.state.maxRowNum}
          changeRowNum={this.changeMaxRowNum}
        />
      </div>
    );
  }
});

// // extract url paramater
// var arg  = {};
// var pair = location.search.substring(1).split('&');
// for(var i = 0; pair[i]; i++) {
//   var kv = pair[i].split('=');
//   arg[kv[0]] = kv[1];
// }

// load database
var comments = [];
console.time("load file");
var getDatabase = jQuery.get("database/commit-message")
  .done(function (data) {
    console.timeEnd("load file");
    comments = data.split("\n");
  })
  .fail(function (e) {
    $('#react').text('error: ' + e.statusText);
    console.log(e);
  });

// render by react
$.when(getDatabase)
  .done(function () {
    ReactDOM.render(
      <FilterableCommentTable comments={comments} />,
      document.getElementById('react')
    );
  });
