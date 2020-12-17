import React from 'react';
import classes from "./css/telaReproducao.module.css";
import { Link } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import firebase from "./autenticacao.js";

class TelaReproducao extends React.Component {
    constructor(props) {
        super(props);
        this.state = { url: '/reproducao', autenticacao: localStorage.autenticacao, videoTitle: '', videoList: [], nextVideo: [] };
    }

    static getDerivedStateFromProps(props, state) {
        //procura usuario com localStorage.autenticacao igual ao seu id
        try {
            firebase.database().ref('usuarios').orderByKey().equalTo(localStorage.getItem('autenticacao')).on('value',
                (snapshot) => {
                    //verifica se existe usuario
                    if (snapshot.val() == null) {
                        localStorage.setItem('autenticacao', JSON.stringify(null));
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
            localStorage.setItem('autenticacao', JSON.stringify(null));
            createBrowserHistory({ forceRefresh: true }).push('/');
        }
        

        return null;
    }

    adicionarProximoVideo = (video, chave) => {
        console.log(video);
        const proximoVideo = (
            <div className={classes.espacoVideo} onClick={this.redirectToNextVideo(chave)} style={{ width: "95%", display: "block", marginLeft: "auto", marginRight: "auto" }}>
                <h4 style={{ paddingTop: 20 }}>{video.titulo}</h4>
                <p>
                    <img style={{ float: "left" }} src={video.localizacaoImagem} height="190" width="360px" alt='' />
                    {video.resumo}
                </p>
            </div>
        );
        this.setState({ nextVideo: proximoVideo });
    }

    sair = () => {
        localStorage.setItem('autenticacao', null);
        this.setState({ url: '/' });
        var linkSairPrincipal = document.getElementById("linkSairReproducao");
        linkSairPrincipal.click();
    }
    componentDidMount() {
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
                            if (childSnapshot.val().administradorUsuarios == 1) {
                                document.getElementById('linkGerenciamentoUsuarios').style.visibility = 'visible';
                            }
                        }
                    );
                } else { createBrowserHistory({ forceRefresh: true }).push('/'); }
            }
        );

        // salva informações do video atual para enviar a tela de upload
        firebase.database().ref('videos/' + localStorage.getItem('telaReproducaoVideoChave')).on('value',
            (snapshot) => {

                if (snapshot.val() != null) {
                    localStorage.tituloVideo = snapshot.val().titulo;
                    localStorage.canal = snapshot.val().canal;
                    localStorage.proximoVideo = snapshot.val().proximoVideo;
                    localStorage.videoAnterior = snapshot.key;
                    localStorage.administradorCanal = snapshot.val().administradorCanal;
                }

            }
        );
        try {
            var adicionarProximoVideo = this.adicionarProximoVideo;
            firebase.database().ref('videos/' + localStorage.telaReproducaoVideo.replace(/\"/g,"")).on('value',
                (snapshot) => {
                    //verifica se existe video
                    
                    if (snapshot.val() != null) {
                        const allData = snapshot.val();
                        localStorage.setItem('videoTitulo', JSON.stringify(allData.titulo));
                        localStorage.setItem('linkVideo', allData.localizacaoVideo);
                        localStorage.setItem('titleVideo', JSON.stringify(allData.titulo));
                        localStorage.setItem('imagemVideo', allData.localizacaoImagem);
                        localStorage.setItem("nextVideoChave", allData.proximoVideo);
                        console.log(localStorage.linkVideo)
                        firebase.database().ref('videos/' + allData.proximoVideo).on('value',
                            (snapshot) => {
                                if (snapshot.val() != null) {

                                    adicionarProximoVideo(snapshot.val(), allData.proximoVideo);
                                }
                            });
                    }
                    else {
                        localStorage.setItem('linkVideo',null)
                    }
                }
            );
        } catch (e) {
            console.log(e);
        }
    }

    redirectToNextVideo=(chave)=>{

    }

    buscaVideo = () => {
        localStorage.textoVindoTelaPrincipal = document.getElementById("tituloInput").value;
    }

    render() {
        return (
            <div className={classes.body}>
                <div className={classes.menu}>
                    <img style={{ float: "left" }} height="43.5px" rel="icon" type="image/png" src={require("./img/logoMiniaturaWhite.png")} alt='' />
                    <Link to="/principal" style={{ padding: 12.75 }}><b>Servidor IPTV</b></Link>
                    <Link to="/upload"><b><i className="fa fa-cloud-upload" aria-hidden="true"></i> Enviar Vídeo</b></Link>
                    <Link to="/gerenciamentousuario" id='linkGerenciamentoUsuarios' style={{ visibility: 'hidden' }}><b><i className="fa fa-user-circle" aria-hidden="true"></i> Gerir Usuários</b></Link>
                    <Link to="/verificacaovideo" id='linkVerificacaoVideos' style={{ visibility: 'hidden' }}><b><i className="fa fa-file-video-o" aria-hidden="true"></i> Novos Vídeos</b></Link>
                    <button onClick={this.sair} style={{ float: "right" }}><b>{localStorage.nomeUsuario} </b><b>|</b><b> Sair</b> <i className="fa">&#xf08b;</i> </button>
                </div>

                <div style={{ paddingLeft: "10%", paddingRight: "10%" }} className={classes.search}>
                    <input type="text" id="tituloInput" className={classes.searchTerm} placeholder="O que você esta procurando?" />
                    <Link type="submit" to="/pesquisa" className={classes.searchButton} onClick={this.buscaVideo}>
                        <i className="fa fa-search"></i>
                    </Link>
                </div>
                <p style={{ backgroundColor: "black", padding: 10 }}>
                    <video poster={localStorage.getItem('imagemVideo')} style={{ display: "block", marginLeft: "auto", marginRight: "auto", maxWidth: 853 }} controls="controls"
                        width="100%">
                        <source src={localStorage.getItem('linkVideo')} type="video/mp4" />
                    </video>
                </p>
                <div>
                    <h3 style={{ paddingLeft: "5%" }}>Próximo Video</h3>

                </div>
                {this.state.nextVideo}
                {/* <div className={classes.espacoVideo} onClick={this.redirectToNextVideo} style={{ width: "95%", display: "block", marginLeft: "auto", marginRight: "auto" }}>
                    <h4 style={{ paddingTop: 20 }}>{this.state.nextVideo.titulo}</h4>
                    <p>
                        <img style={{ float: "left" }} src={this.state.nextVideo.localizacaoImagem} height="190" width="360px" alt='' />
                        {this.state.nextVideo.resumo}
                    </p>
                </div> */}
                <footer style={{ backgroundColor: "#a6ace4", height: 40, textAlign: "center", }}>
                    <p style={{ position: "absolute", width: "100%" }} >© 2020 Servidor IPTV</p>
                </footer>
            </div>
        );
    }
}

export default TelaReproducao;

