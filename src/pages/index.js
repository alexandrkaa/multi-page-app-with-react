import React from 'react';
import ReactDOM from 'react-dom';
import Menu from 'components/Menu';
import Link from 'components/Link/Link';
import Link2 from 'components/Link2';

ReactDOM.render(<Menu />, document.getElementById('menu'));
ReactDOM.render(<Link />, document.getElementById('link'));
ReactDOM.render(<Link2 />, document.getElementById('link2'));
