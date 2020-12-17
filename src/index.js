import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import './index.css';
import * as serviceWorker from './serviceWorker';
import TelaPesquisa from './telaPesquisa.js';
import TelaUpload from './telaUpload.js';
import TelaGerenciamentoUsuario from './telaGerenciamentoUsuario.js';
import EditUser from './EditUser'
import TelaPrincipal from './telaPrincipal.js';
import TelaReproducao from './telaReproducao.js';
import TelaVerificacaoVideo from './telaVerificacaoVideo.js';
import TelaLogin from './telaLogin.js';
import Tela404 from './tela404.js';

ReactDOM.render( 
    <BrowserRouter>
        <Switch>
            <Route path="/" exact={true} component={TelaLogin}/>
            <Route path="/pesquisa" exact={true} component={TelaPesquisa}/>
            <Route path="/upload" exact={true} component={TelaUpload}/>
            <Route path="/gerenciamentousuario" exact={true} component={TelaGerenciamentoUsuario}/>
            <Route path="/edit-user" exact={true} component={EditUser}/>
            <Route path="/principal" exact={true} component={TelaPrincipal}/>
            <Route path="/reproducao" exact={true} component={TelaReproducao}/>
            <Route path="/verificacaovideo" component={TelaVerificacaoVideo}/>
            <Route path='*' component={Tela404} />
        </Switch>
    </ BrowserRouter>
,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();

