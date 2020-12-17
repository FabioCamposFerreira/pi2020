import React from 'react';
import classes from "./css/telaUpload.module.css";
import { Link } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import firebase from "./autenticacao.js";

class TelaUpload extends React.Component {
    constructor(props) {
        super(props);
        this.state = { url: '/upload', autenticacao: localStorage.autenticacao };
    }

    static getDerivedStateFromProps(props, state) {
        //executa antes da construção do DOM
        //procura usuario com localStorage.autenticacao igual ao seu id
        try {
            firebase.database().ref('usuarios').orderByKey().equalTo(localStorage.autenticacao).on('value',
                (snapshot) => {
                    //verifica se existe usuario
                    if (snapshot.val() == null) {
                        localStorage.autenticacao = null;
                        console.log(localStorage.autenticacao)
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
            console.log(localStorage.autenticacao)
            createBrowserHistory({ forceRefresh: true }).push('/');
        }
        return null;
    }

    componentDidMount() {
        //executa quando o DOM foi construido
        firebase.database().ref('usuarios').orderByKey().equalTo(localStorage.autenticacao).on('value',
            (snapshot) => {
                //verifica se gerenciador do canal
                if (snapshot.val() != null) {
                    snapshot.forEach(
                        (childSnapshot) => {
                            if (childSnapshot.val().administradorCanal !== "") {
                                document.getElementById('linkVerificacaoVideos').style.visibility = 'visible';
                            }
                            if (childSnapshot.val().administradorUsuarios === 1) {
                                document.getElementById('linkGerenciamentoUsuarios').style.visibility = 'visible';
                            }
                        }
                    );
                }
                //verificando se um video em uma canal foi selecionado. Se não bloqueia a página
                console.log(typeof (localStorage.responsavel));
                if (typeof (localStorage.canal) != 'string' || typeof (localStorage.administradorCanal) != 'string' || typeof (localStorage.proximoVideo) != 'string' || typeof (localStorage.videoAnterior) != 'string') {
                    document.getElementById("telaUpload").innerHTML = "Ocorei um erro na identificação do video. Volte para a tela de reprodução do video requerido e tente adcionar outro novamente!"
                }
            }
        );
    }

    sair = () => {
        localStorage.autenticacao = null;
        this.setState({ url: '/' });
        var linkSairPrincipal = document.getElementById("linkSairUpload");
        linkSairPrincipal.click();
    }

    adicionarVideo = () => {
        var atualizarBancoVideos = this.atualizarBancoVideos;
        var mudarNomeArquivo = this.mudarNomeArquivo;
        var videoKey = '';
        var erro = document.getElementById('fraseErro');
        erro.innerHTML = '';
        var localizacaoVideo = '';
        var localizacaoImagem = '';
        var titulo = document.getElementById('titulo');
        var resumo = document.getElementById('resumo');
        var canal = localStorage.canal; //string
        var atores = document.getElementById('atores');
        var responsavel = localStorage.autenticacao;//firebase key
        var administradorCanal = localStorage.administradorCanal;//firebase key
        var proximoVideo = localStorage.proximoVideo; //firebase key
        var videoAnterior = localStorage.videoAnterior; //firebase key
        var uploader = document.getElementById('uploaderVideoThumbnail');
        var selecaoVideo = document.getElementById('selecaoVideo');
        var selecaoThumbnail = document.getElementById('selecaoThumbnail');
        var videoArquivo = selecaoVideo.files[0];
        var thumbnailArquivo = selecaoThumbnail.files[0];
        //pegando duração do video em minutos
        var duracao = localStorage.duracao;
        //verifica o formato do video
        if (videoArquivo !== undefined && thumbnailArquivo !== undefined) {
            if (videoArquivo.name.includes('.mp4')) {
                //verifica o formato do imagem
                if (thumbnailArquivo.name.includes('.png') || thumbnailArquivo.name.includes('.jpg')) {
                    //verifica se o texto dos campos tem tamanho minimo
                    if (titulo.value.length > 2 && resumo.value.length > 2 && atores.value.length > 2) {
                        var videoLink = firebase.storage().ref('arquivos/' + Math.random().toString(36).substr(2) + videoArquivo.name);
                        var thumbnailLink = firebase.storage().ref('arquivos/' + Math.random().toString(36).substr(2) + thumbnailArquivo.name);
                        //envia video ao firebase
                        var enviarVideo = videoLink.put(videoArquivo);
                        uploader.style.visibility = 'visible';
                        enviarVideo.on('state_changed', function progess(snapshot) {
                            // alert(snapshot.bytesTransferred);
                            // alert(snapshot.totalBytes);
                            var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            uploader.value = percentage;
                        },
                            function error(err) {
                                console.log(err);
                            },
                            function complete() {
                                //pega url do video
                                enviarVideo.snapshot.ref.getDownloadURL().then(
                                    function (downloadURL) {
                                        localizacaoVideo = downloadURL;
                                        //envia a imagem ao firebase
                                        var enviarThumbnail = thumbnailLink.put(thumbnailArquivo);
                                        enviarThumbnail.on('state_changed', function progess(snapshot) {
                                            // alert(snapshot.bytesTransferred);
                                            // alert(snapshot.totalBytes);
                                            var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                                            uploader.value = percentage;
                                        },
                                            function error(err) {
                                                console.log(err);
                                            },
                                            function complete() {
                                                //pega url da imagem
                                                enviarThumbnail.snapshot.ref.getDownloadURL().then(
                                                    function (downloadURL) {
                                                        localizacaoImagem = downloadURL;
                                                        console.log(localizacaoImagem);
                                                        videoKey = atualizarBancoVideos(localizacaoVideo, localizacaoImagem, titulo.value, resumo.value, canal, atores.value, responsavel, administradorCanal, proximoVideo, videoAnterior, duracao);
                                                        //resetar campos de texto
                                                        titulo.value = '';
                                                        resumo.value = '';
                                                        atores.value = '';
                                                        //resetar arquivos
                                                        document.getElementById('selecaoVideo').value = null;
                                                        document.getElementById('selecaoThumbnail').value = null;
                                                        mudarNomeArquivo();
                                                        //para um novo video o video anterior a este é o que acobou de envia
                                                        videoAnterior = videoKey;
                                                        erro.style.color = "blue";
                                                        erro.innerHTML = "Envio completo!";
                                                        createBrowserHistory({ forceRefresh: true }).push('/reproducao');
                                                    });


                                            })

                                    });

                            }
                        )
                    }
                    else {
                        erro.style.color = "red";
                        erro.innerHTML = "Campos invalidos!";
                    }
                }
                else {
                    erro.style.color = "red";
                    erro.innerHTML = "Image não é valida!";
                }
            }
            else {
                erro.style.color = "red";
                erro.innerHTML = "Video não é valido!";
            }
        }
        else {
            erro.style.color = "red";
            erro.innerHTML = "Adicione os arquivos!";
        }


    }

    duracaoVideo = (arquivo) => {
        var video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = function () {
            window.URL.revokeObjectURL(video.src);
            localStorage.duracao = Math.ceil(video.duration/60);
        }
        video.src = URL.createObjectURL(arquivo);
    }

    atualizarBancoVideos = (localizacaoVideo, localizacaoImagem, titulo, resumo, canal, atores, responsavel, administradorCanal, proximoVideo, videoAnterior, duracao) => {
        var atualizar = {};
        //evita erro undefined do firebase
        if (canal === undefined) { canal = '' };
        if (administradorCanal === undefined) { administradorCanal = '' };
        if (proximoVideo === undefined) { proximoVideo = '' };
        //criando video no banco de dados
        var data = { localizacaoVideo: localizacaoVideo, localizacaoImagem: localizacaoImagem, titulo: titulo, resumo: resumo, canal: canal, atores: atores, responsavel: responsavel, administradorCanal: administradorCanal, aprovado: 0, proximoVideo: proximoVideo, duracao: duracao, ano: new Date().getFullYear() };
        var videoKey = firebase.database().ref().child('videos').push(data).key;
        //adicionando palavras chave do titulo
        var palavrasChaveTitulo = titulo.toLowerCase().replace(/\./g, '?').replace('#', '?').replace('[', '?').replace(']', '?').split(' ');
        for (var i = 0; i < palavrasChaveTitulo.length; i++) {
            firebase.database().ref("videos/" + videoKey + "/palavrasChaveTitulo-" + palavrasChaveTitulo[i]).set(true);
        }
        //adicionando palavras chave do Resumo
        var palavrasChaveResumo = resumo.toLowerCase().replace(/\./g, '?').replace('#', '?').replace('[', '?').replace(']', '?').split(' ');
        for (var j = 0; j < palavrasChaveResumo.length; j++) {
            firebase.database().ref("videos/" + videoKey + "/palavrasChaveResumo-" + palavrasChaveResumo[j]).set(true);
        }
        //adicionando palavras chave do canal
        var palavrasChaveCanal = canal.toLowerCase().replace(/\./g, '?').replace('#', '?').replace('[', '?').replace(']', '?').split(' ');
        for (var k = 0; k < palavrasChaveCanal.length; k++) {
            firebase.database().ref("videos/" + videoKey + "/palavrasChaveCanal-" + palavrasChaveCanal[k]).set(true);
        }
        //adicionando palavras chave do atores
        var palavrasChaveAtores = atores.toLowerCase().replace(/\./g, '?').replace('#', '?').replace('[', '?').replace(']', '?').split(' ');
        for (var m = 0; m < palavrasChaveAtores.length; m++) {
            firebase.database().ref("videos/" + videoKey + "/palavrasChaveAtores-" + palavrasChaveAtores[m]).set(true);
        }
        //atualizando video anterior
        atualizar[videoAnterior+"/proximoVideo"] = videoKey;
        firebase.database().ref('videos').update(atualizar);
        return videoKey;
    }

    mudarNomeArquivo = () => {
        try{
            this.duracaoVideo(document.getElementById('selecaoVideo').files[0]);
        }catch{}
        try {
            document.getElementById('nomeImage').innerHTML = document.getElementById('selecaoThumbnail').files[0].name;
        }
        catch {
            document.getElementById('nomeImage').innerHTML = '';
        }
        try {
            document.getElementById('nomeVideo').innerHTML = document.getElementById('selecaoVideo').files[0].name;
        } catch {
            document.getElementById('nomeVideo').innerHTML = '';
        }

    }

    render() {
        return (
            <div className={classes.body} id="telaUpload">
                <div className={classes.menu}>
                    <img style={{ float: "left" }} rel="icon" type="image/png" src={require("./img/logoMiniaturaWhite.png")} height="43.5px" alt='' />
                    <Link to="/principal" style={{ padding: "12.75px" }}><b>Servidor IPTV</b></Link>
                    <Link to="/gerenciamentousuarios" id='linkGerenciamentoUsuarios' style={{ visibility: 'hidden' }}><b><i className="fa fa-user-circle" aria-hidden="true"></i> Gerir Usuários</b></Link>
                    <Link to="/verificacaovideos" id='linkVerificacaoVideos' style={{ visibility: 'hidden' }}><b><i className="fa fa-file-video-o" aria-hidden="true"></i> Novos Vídeos</b></Link>
                    <button onClick={this.sair} style={{ float: "right" }}><b>{localStorage.nomeUsuario} </b><b>|</b><b> Sair</b> <i className="fa">&#xf08b;</i> </button>
                </div>
                <input id='selecaoVideo' onChange={this.mudarNomeArquivo} style={{ visibility: "hidden" }} type='file'></input>
                <div>
                    <h3 style={{ paddingLeft: "5%" }}>Adicionar Vídeo como complemento de {localStorage.tituloVideo}</h3>
                </div>
                <div className={classes.adicionarVideo}>
                    <div className={classes.fichaDados}>
                        <div>Título: </div>
                        <div className={classes.search}>
                            <input type="text" id='titulo' className={classes.searchTerm} placeholder="digite o título do vídeo..." />
                        </div>
                        <div>Resumo: </div>
                        <div className={classes.search}>
                            <textarea type="text" rows="5" id='resumo' className={classes.searchTerm} style={{ height: "100px" }} placeholder="digite o resumo do vídeo..."></textarea>
                        </div>
                        <div>Atores: </div>
                        <div className={classes.search}>
                            <input type="text" id='atores' className={classes.searchTerm} placeholder="quem está no vídeo..." />
                        </div>
                    </div>
                    <label className="btn btn-lg btn-block btn-primary" style={{ maxWidth: "30%", margin: "auto" }} htmlFor='selecaoThumbnail'>Selecione a thumbnail </label>
                    <p id='nomeImage' style={{ margin: 'auto' }}></p>
                    <label className="btn btn-lg btn-block btn-primary" style={{ maxWidth: "20%", margin: "auto" }} htmlFor='selecaoVideo'>Selecione o video </label>
                    <p id='nomeVideo' style={{ margin: 'auto' }}></p>
                    <input id='selecaoThumbnail' onChange={this.mudarNomeArquivo} style={{ visibility: "hidden" }} type='file'></input>
                    <p style={{ textAlign: "center" }} id="fraseErro"></p>
                    <progress value="0" max="100" style={{ visibility: "hidden", margin: 'auto', maxWidth: '50%' }} id="uploaderVideoThumbnail"></progress>
                    <button className={classes.openbtn} style={{ maxWidth: "20%", margin: "auto" }} onClick={this.adicionarVideo} ><font size="+3">+</font> Adicionar</button>
                </div>
                <Link to={this.state.url} id="linkSairUpload"></Link>
                <footer className={classes.rodape}>
                    <p className={classes.rodapeTexto}>© 2020 Servidor IPTV</p>
                </footer>
            </div >
        );
    }
}

export default TelaUpload;

