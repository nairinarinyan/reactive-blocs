import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import iconDefinitions from '!!raw-loader!./shared/components/icons/icon-definitions.svg';
import './styles/styles.styl';

import { Home } from "./home/home";

const Root = () => (
    <>
        <span dangerouslySetInnerHTML={{ __html: iconDefinitions }} />
        <Router>
            <Switch>
                <Route path="/" component={Home} />} />
            </Switch>
        </Router>
    </>
);

render(
    <Root />,
    document.getElementById("root")
);