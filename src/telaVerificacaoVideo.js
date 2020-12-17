import React from 'react';
import { Link } from 'react-router-dom';
import classes from './css/telaVerificacaoVideo.module.css';
import { createBrowserHistory } from 'history';
import firebase from "./autenticacao.js";

class VerificacaoVideo extends React.Component {

    constructor(props) {
        super(props);
        this.state = { url: '/verificacaovideo', autenticacao: localStorage.autenticacao };
        this.videos = [];
    }

    static getDerivedStateFromProps(props, state) {
        //procura usuario com localStorage.autenticacao igual ao seu id
        try {
            firebase.database().ref('usuarios').orderByKey().equalTo(localStorage.autenticacao).on('value',
                (snapshot) => {
                    //verifica se existe usuario
                    if (snapshot.val() == null) {
                        localStorage.autenticacao = null;
                        //console.log(localStorage.autenticacao)
                        createBrowserHistory({ forceRefresh: true }).push('/');
                    } else {
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
            localStorage.autenticacao = null;
            //console.log(localStorage.autenticacao)
            createBrowserHistory({ forceRefresh: true }).push('/');
        }
        return null;
    }

    async componentDidMount() {
        //executa quando o DOM foi construido
        firebase.database().ref('usuarios').orderByKey().equalTo(localStorage.autenticacao).on('value',
            (snapshot) => {
                //verifica se gerenciador do canal
                if (snapshot.val() != null) {
                    snapshot.forEach(
                        (childSnapshot) => {
                            if (childSnapshot.val().administradorUsuarios === 1) {
                                document.getElementById('linkGerenciamentoUsuarios').style.visibility = 'visible';
                            }
                        }
                    );
                    // createBrowserHistory({ forceRefresh: true }).push('/');
                }
            }
        );
        var adicionarVideo = this.adicionarVideo;
        firebase.database().ref('videos').orderByChild('aprovado').equalTo(0).on('value', function (snapshot) {
            var adicionarVideos = snapshot.val();
            if (!adicionarVideos) {
                return
            }
            var keys = Object.keys(adicionarVideos);
            for (var i = 0; i < keys.length; i++) {
                var k = keys[i];
                adicionarVideo(adicionarVideos, k);
            }
        })
    }
    deletarVideo = (k) => {
        firebase.database().ref(`videos/${k}`).remove();
        window.location.reload()
    }
    aprovarVideos = (k) => {
        firebase.database().ref(`videos/${k}`).update({
            aprovado: 1
        });
        window.location.reload()
    }

    adicionarVideo = (videosaprovar, k) => {
        const novosVideos = (
            <div className={classes.style}>
                <div className={classes.style1}>
                    <img src={videosaprovar[k].localizacaoImagem} height="100%" width="360px" alt='' /><p style={{ padding: "5px" }} >
                        <b>{videosaprovar[k].titulo}</b><br />
                        <br />{videosaprovar[k].resumo}<br />
                        <br /><b>{videosaprovar[k].canal}</b></p>
                    <div className={classes.style3}>
                        <i onClick={() => this.aprovarVideos(k)} style={{ cursor: 'pointer' }} className="fa fa-check" aria-hidden="true"></i>
                    </div>
                    <div className={classes.style4}>
                        <i onClick={() => this.deletarVideo(k)} style={{ cursor: 'pointer' }} className="fa fa-times" aria-hidden="true"></i>
                    </div>
                </div>
            </div>
        );
        this.videos.push(novosVideos);
        this.setState({ gridVideos: React.createElement('div', { className: classes.gridContainer }, this.videos) });
    }

    sair = () => {
        localStorage.autenticacao = null;
        this.setState({ url: '/' });
        var linkSairPrincipal = document.getElementById("linkSairVerificacaoVideo");
        linkSairPrincipal.click();
    }

    render() {
        return (
            <div className={classes.body}>
                <div className={classes.menu}>
                    <img style={{ float: "left" }} src={require("./img/logoMiniaturaWhite.png")} rel="icon" type="image/png" height="43.5px" alt='' />
                    <Link to="/principal" style={{ padding: "12.75px" }}><b>Servidor IPTV</b></Link>
                    <Link to="/gerenciamentousuario" id='linkGerenciamentoUsuarios' style={{ visibility: 'hidden' }}><b><i className="fa fa-user-circle" aria-hidden="true"></i> Gerir Usuários</b></Link>
                    <button onClick={this.sair} style={{ float: "right" }}><b>{localStorage.nomeUsuario} </b><b>|</b><b> Sair</b> <i className="fa">&#xf08b;</i> </button>
                </div>
                <div>
                    <h3 style={{ paddingLeft: "10%" }}>Novos Vídeos</h3>
                </div>

                {this.state.gridVideos}

                <footer className={classes.style5}>
                    <p className={classes.style6}>© 2020 Servidor IPTV</p>
                </footer>

            </div>
        );
    }
}

export default VerificacaoVideo;