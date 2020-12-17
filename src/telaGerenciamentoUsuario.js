import React from 'react';
import classes from "./css/gerenciamentoUsuario.module.css";
import { Link } from 'react-router-dom';
import firebase from "./autenticacao.js";
import { createBrowserHistory } from 'history';
import './css/gerenciamentoUsuario.css'


class TelaGerenciamentoUsuario extends React.Component {
    constructor(props) {
        super(props);
        this.state = { url: '/gerenciamentousuario', autenticacao: localStorage.getItem('autenticacao'), listaUsuarios: [] };
        this.usuario = [];
    }

    static getDerivedStateFromProps(props, state) {
        //procura usuario com localStorage.autenticacao igual ao seu id
        try {
            firebase.database().ref('usuarios').orderByKey().equalTo(localStorage.getItem('autenticacao')).on('value',
                (snapshot) => {
                    //verifica se existe usuario
                    let user = [];
                    snapshot.forEach(snapshotChild => {
                        user.push(snapshotChild.val())
                    })
                    if (snapshot.val() == null) {
                        localStorage.setItem('autenticacao', JSON.stringify(null));
                        createBrowserHistory({ forceRefresh: true }).push('/');
                    } else if (user[0].administradorUsuarios === 0) {
                        createBrowserHistory({ forceRefresh: true }).push('/principal');
                    }else {
                        //verifica se usuario esta autorizado
                        snapshot.forEach(
                            (childSnapshot) => {
                                if (childSnapshot.val().autorizacao != 1) {
                                    localStorage.autenticacao = null;
                                    createBrowserHistory({ forceRefresh: true }).push('/');
                                }
                            }
                        );
                    }
                }
            );
        } catch (error) {
            // executado quando localStorage.autenticacao é indefinido
            localStorage.setItem('autenticacao', JSON.stringify(null));
            createBrowserHistory({ forceRefresh: true }).push('/');
        }
        return null;
    }

    componentDidMount = () => {
        //executa quando o DOM foi construido
        firebase.database().ref('usuarios').orderByKey().equalTo(localStorage.autenticacao).on('value',
            (snapshot) => {
                //verifica se gerenciador do canal
                if (snapshot.val() != null) {
                    snapshot.forEach(
                        (childSnapshot) => {
                            if (childSnapshot.val().administradorCanal != "") {
                                document.getElementById('linkVerificacaoVideos').style.visibility = 'visible';
                            }
                        }
                    );
                } else { createBrowserHistory({ forceRefresh: true }).push('/'); }
            }
        );
        this.searchUnathorizedUsers()
    }

    searchUnathorizedUsers = () => {
        firebase.database().ref('usuarios').orderByChild('autorizacao').equalTo(0).on('value',
            (snapshot) => {
                snapshot.forEach(snapshotChild => {
                    const usuario = snapshotChild.val();
                    const userKey = snapshotChild.key;

                    const novoUsuario = (
                        <div key={userKey} style={{ display: "grid", margin: "30px" }}>
                            <div style={{ padding: "10px", backgroundColor: "white", maxHeight: "270px", maxWidth: "100%", display: "grid", gridTemplateColumns: "200px auto" }}>
                                <div></div>
                                <div className="userStatus" >
                                    <font size="1"></font> Usuário pendente de autorização
                            </div>
                                <img className="userPhoto" src={require("./img/people.jpg")} height="200px" alt='' />
                                <p style={{ padding: "5px", lineHeight: 1.5 }}>
                                    <b>Nome: </b>{usuario.nome}<br />
                                    <b>Administrador de Usuários: </b>{usuario.administradorUsuarios === 1 ? 'Sim' : 'Não'}<br />
                                    <b>Canal: </b>{usuario.canal ? usuario.canal : 'Canal não registrado'}<br />
                                    <b>E-mail: </b>{usuario.email}<br />
                                    <b>Autorização de Acesso: </b>{usuario.autorizacao === 1 ? 'Sim' : 'Não'}<br />
                                </p>
                            </div>
                            <button onClick={() => this.deleteUser(userKey)} className="deleteBtn" type="button">Excluir usuário</button>
                            <button onClick={() => this.authorizeUser(userKey)} className="authorizeBtn" type="button">Autorizar usuário</button>
                        </div>);
                    this.usuario.push(novoUsuario);
                    this.setState({ listaUsuarios: React.createElement('div', {}, this.usuario) })
                })
            }
        );
    }

    sair = () => {
        localStorage.setItem('autenticacao', JSON.stringify(null));
        this.setState({ url: '/' });
        var linkSairGerenciamentoUsuario = document.getElementById("linkSairGerenciamentoUsuario");
        linkSairGerenciamentoUsuario.click();
    }

    deleteUser = (userKey) => {
        this.usuario = [];
        firebase.database().ref(`usuarios/${userKey}`).remove();
        window.location.reload()
    }

    authorizeUser = (userKey) => {
        this.usuario = [];
        firebase.database().ref(`usuarios/${userKey}`).update({
            autorizacao: 1
        });
    }

    pesquisa = () => {
        this.usuario = [];
        this.setState({ listaUsuarios: [] });
        var adicionarUsariosTela = this.adicionarUsariosTela;
        var nomeUsuario = document.getElementById("nomeInput").value;
        firebase.database().ref('usuarios').orderByChild('nome').equalTo(nomeUsuario).on('value', (snapshot) => {
            let users = [];
            snapshot.forEach((childSnapshot) => {
                adicionarUsariosTela(childSnapshot.val(), childSnapshot.key);

                users.push(childSnapshot.val())
            })
            //var listaUsuarios = snapshot.val();
            // var keys = Object.keys(listaUsuarios);
            // for(var i =0; i<keys.length; i++){
            // var k = keys[i];
            // var nome = listaUsuarios[k].nome;

            //  }
        });
    }
    adicionarUsariosTela = (usuario, userKey) => {
        const novoUsuario = (
            <div key={userKey} style={{ display: "grid", margin: "30px" }}>
                <div style={{ padding: "10px", backgroundColor: "white", maxHeight: "270px", maxWidth: "100%", display: "grid", gridTemplateColumns: "200px auto" }}>
                    <div></div>
                    <button className={classes.openbtn} onClick={() => this.handleNavigateToEditProfile(usuario, userKey)}>
                        <font size="1"></font> Editar usuário
                </button>
                    <img className="userPhoto" src={require("./img/people.jpg")} height="200px" alt='' />
                    <p style={{ padding: "5px", lineHeight: 1.5 }}>
                        <b>Nome: </b>{usuario.nome}<br />
                        <b>Administrador de Usuários: </b>{usuario.administradorUsuarios === 1 ? 'Sim' : 'Não'}<br />
                        <b>Canal: </b>{usuario.canal ? usuario.canal : 'Canal não registrado'}<br />
                        <b>E-mail: </b>{usuario.email}<br />
                        <b>Autorização de Acesso: </b>{usuario.autorizacao === 1 ? 'Sim' : 'Não'}<br />
                    </p>
                </div>
                <button onClick={() => this.deleteUser(userKey)} className="deleteBtn" type="button">Excluir usuário</button>
            </div>);
        this.usuario.push(novoUsuario);
        this.setState({ listaUsuarios: React.createElement('div', {}, this.usuario) })
    }
    handleNavigateToEditProfile = (user, userKey) => {
        const userFormated = {
            nome: user.nome,
            email: user.email,
            autorizacao: user.autorizacao,
            administradorUsuarios: user.administradorUsuarios,
            canal: user.canal ? user.canal : 'Canal não registrado',
            userKey,
        }
        localStorage.setItem('@IPTV:UserToBeAltered', JSON.stringify(userFormated));
        this.props.history.push('/edit-user')
    }
    render() {
        return (
            <div className={classes.body}>
                <div className={classes.menu}>
                    <img style={{ float: "left" }} height="43.5px" rel="icon" type="image/png" src={require("./img/logoMiniaturaWhite.png")} alt='' />
                    <Link to="/principal" style={{ padding: 12.75 }}><b>Servidor IPTV</b></Link>
                    <Link to="/gerenciamentousuario" ><b><i className="fa fa-user-circle" aria-hidden="true"></i> Gerir Usuários</b></Link>
                    <Link to="/verificacaovideo" id='linkVerificacaoVideos' style={{ visibility: 'hidden' }}><b><i className="fa fa-file-video-o" aria-hidden="true"></i> Novos Vídeos</b></Link>
                    <button onClick={this.sair} style={{ float: "right" }}><b>{localStorage.nomeUsuario} </b><b>|</b><b> Sair</b> <i className="fa">&#xf08b;</i> </button>
                </div>

                <div>
                    <h3 style={{ paddingLeft: "5%" }}>Procurar Usuários</h3>
                </div>
                <div className={classes.search} style={{ paddingLeft: "10%", paddingRight: "10%" }}>
                    <input type="text" className={classes.searchTerm} id="nomeInput" placeholder="Quem você esta procurando?" />
                    <button type="submit" className={classes.searchButton} onClick={this.pesquisa}>
                        <i className="fa fa-search"></i>
                    </button>
                </div>
                <div>
                    <h3 style={{ paddingLeft: "5%" }}>Usuários Encontrados</h3>
                    {this.state.listaUsuarios}
                </div>
                {/*  <div style={{ display: "grid", margin: "30px" }}>
                    <div style={{ padding: "10px", backgroundColor: "white", maxHeight: "270px", maxWidth: "100%", display: "grid", gridTemplateColumns: "200px auto" }}>
                        <div></div>
                        <div style={{ padding: "5px", textAlign: "center", backgroundColor: " #24a2b3", color: "white", margin: "5px", height: "30px", width: "100px" }}> <i class="fa fa-pencil" aria-hidden="true"></i><b> Editar</b></div>
                        <img src={require("./img/people.jpg")} height="200px" />
                        <p style={{ padding: "5px", lineHeight: 1.5 }}>
                        <b>Fulano de Tal</b>console.log(snapshot.val())<br />
                        <b>Administrador de Usuários: </b> Não<br />
                        <b>Canal: </b> Não possui<br />
                        <b>E-mail: </b> fulanodetal@gmail.com<br />
                        </p>
                        <div></div>
                        <div style={{ fontSize: "xx-large", textAlign: "center", backgroundColor: " #24a2b3", color: "red", margin: "5px", height: "30px" }}><i class="fa fa-times" aria-hidden="true"></i></div>
                    </div>
                </div */}
                {/*  <div style={{ display: "grid", margin: "30px" }}>
                    <div style={{ padding: "10px", backgroundColor: "white", maxHeight: 270, maxWidth: "100%", display: "grid", gridTemplateColumns: "200px auto" }}>
                        <div></div>
                        <div style={{ padding: "5px", textAlign: "center", backgroundColor: "#24a2b3", color: "white", margin: "5px", height: "30px", width: "100px" }}><i class="fa fa-pencil" aria-hidden="true"></i><b> Editar</b></div>
                        <img src={require("./img/people.jpg")} height="200px"/>
                        <p style={{ padding: "5px", lineHeight: 1.5 }}>
                        <b>Ciclano do Beltrano</b><br />
                        <b>Administrador de Usuários: </b> Não<br />
                        <b>Canal: </b> Redes de Computadores<br />
                        <b>E-mail: </b> fulanodetal@gmail.com<br /></p>
                        <div></div>
                        <div style={{ fontSize: "xx-large", textAlign: "center", backgroundColor: " #24a2b3", color: "red", margin: "5px", height: "30px" }}><i class="fa fa-times" aria-hidden="true"></i></div>
                    </div>
                </div> */}
                <Link to={this.state.url} id="linkSairGerenciamentoUsuario"></Link>
                <footer style={{ backgroundColor: "#a6ace4", height: "40px", textAlign: "center " }}>

                    <p style={{ position: "absolute", width: "100%" }}>© 2020 Servidor IPTV</p>
                </footer>
            </div>
        );
    }
}
export default TelaGerenciamentoUsuario;