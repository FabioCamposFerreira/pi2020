import React from 'react';
import classes from "./css/telaPesquisa.module.css";
import { Link } from 'react-router-dom';
import firebase from "./autenticacao.js";
import { createBrowserHistory } from 'history';


class TelaPesquisa extends React.Component {
    constructor(props) {
        super(props);
        this.state = { url: '/pesquisa', autenticacao: localStorage.autenticacao, gridVideos: [] };
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

        this.pesquisar(undefined, localStorage.textoVindoTelaPrincipal);
    }

    sair = () => {
        localStorage.autenticacao = null;
        this.setState({ url: '/' });
        var linkSairPrincipal = document.getElementById("linkSairPesquisa");
        linkSairPrincipal.click();
    }

    openNav = () => {
        document.getElementById("e").style.width = "250px";
        document.getElementById("main").style.marginLeft = "250px";
    }

    closeNav = () => {
        document.getElementById("e").style.width = "0";
        document.getElementById("main").style.marginLeft = "0";
    }

    filtros = () => {
        let tamanhoAtual = document.getElementById('e').style.width;
        if (tamanhoAtual === "0px" || tamanhoAtual === 0) {
            this.openNav()
        } else {
            this.closeNav()
        }
    }

    pesquisar = (event, textoVindoTelaPrincipal) => {
        //bloqueia execução se não foi apertado o botão ou se não foi pressionado a tecla "Enter"
        try { if (event.key !== 'Enter' && event.key !== undefined) { return null } }
        catch { }
        //verifica se a função foi chamada pela tela principal ou pela propria tela de pesquisa
        if (textoVindoTelaPrincipal !== undefined) {
            var textoParaPesquisa = textoVindoTelaPrincipal;
            localStorage.textoVindoTelaPrincipal = undefined;
        }
        else {
            textoParaPesquisa = document.getElementById('textoParaPesquisa').value;
        }
        //verifica se digitou alguma coisa
        var erro = document.getElementById('fraseErro');
        erro.innerHTML = '';
        if (textoParaPesquisa.length === 0) {
            erro.style.color = "red";
            erro.innerHTML = "Digite alguma palavra!";
            return null
        }
        //criando variaveis usadas
        var pesquisarEmTitulo = document.getElementById('pesquisarEmTitulo').checked;
        var pesquisarEmResumo = document.getElementById('pesquisarEmResumo').checked;
        var pesquisarEmAtores = document.getElementById('pesquisarEmAtores').checked;
        var pesquisarEmResponsavel = document.getElementById('pesquisarEmResponsavel').checked;
        var pesquisarEmAdministrador = document.getElementById('pesquisarEmAdministrador').checked;
        var pesquisarEmCanal = document.getElementById('pesquisarEmCanal').checked;
        var tempoMinimo = parseInt(document.getElementById('tempoMinimo').value);
        var tempoMaximo = parseInt(document.getElementById('tempoMaximo').value);
        var ano = parseInt(document.getElementById('ano').value);
        var listaIdVideosEncontrados = [];
        var adicionarATela = this.adicionarATela;
        //limpar tela
        this.videos = [];
        this.setState({ gridVideos: [] });
        //vefificando se foi estipilado um limite de tempo ou ano do video
        if (isNaN(ano)) { ano = null; }
        if (isNaN(tempoMinimo)) { tempoMinimo = null; }
        if (isNaN(tempoMaximo)) { tempoMaximo = null; }
        //transforma texto de pesquisa em palavras chaves
        var palavrasChaves = textoParaPesquisa.toLowerCase().replace('.', '').replace('#', '').replace('[', '').replace(']', '').split(' ').sort(function (a, b) { return b.length - a.length; });
        //verifica se é para pesquisa no titulo
        if (pesquisarEmTitulo) {
            for (var i = 0; i < palavrasChaves.length; i++) {
                firebase.database().ref('videos').orderByChild('palavrasChaveTitulo-' + palavrasChaves[i]).equalTo(true).on('value',
                    (snapshot) => {
                        //verifica se videos foram encontrados
                        if (snapshot.val() != null) {
                            snapshot.forEach(function (childSnapshot) {
                                //verifica tempo minimo
                                if (tempoMinimo == null || childSnapshot.val().duracao >= tempoMinimo) {
                                    //verifica tempo maximo
                                    if (tempoMaximo == null || childSnapshot.val().duracao <= tempoMaximo) {
                                        //verifica ano
                                        if (ano == null || childSnapshot.val().ano === ano) {
                                            //verifica se tem mais de 30 videos encontrados e se o video ainda não foi adicionado
                                            if (listaIdVideosEncontrados.length < 30 && !listaIdVideosEncontrados.includes(childSnapshot.key)) {
                                                adicionarATela(childSnapshot.val(),childSnapshot.key);
                                                listaIdVideosEncontrados.push(childSnapshot.key);
                                            }
                                        }
                                    }
                                }
                            });
                        }
                    }
                );
            }

        }
        //verifica se é para pesquisa no resumo
        if (pesquisarEmResumo) {
            for (var k = 0; k < palavrasChaves.length; k++) {
                firebase.database().ref('videos').orderByChild('palavrasChaveResumo-' + palavrasChaves[k]).equalTo(true).on('value',
                    (snapshot) => {
                        //verifica se videos foram encontrados
                        if (snapshot.val() != null) {
                            snapshot.forEach(function (childSnapshot) {
                                //verifica tempo minimo
                                if (tempoMinimo == null || childSnapshot.val().duracao >= tempoMinimo) {
                                    //verifica tempo maximo
                                    if (tempoMaximo == null || childSnapshot.val().duracao <= tempoMaximo) {
                                        //verifica ano
                                        if (ano == null || childSnapshot.val().ano === ano) {
                                            //verifica se tem mais de 30 videos encontrados e se o video ainda não foi adicionado
                                            if (listaIdVideosEncontrados.length < 30 && !listaIdVideosEncontrados.includes(childSnapshot.key)) {
                                                adicionarATela(childSnapshot.val(),childSnapshot.key);
                                                listaIdVideosEncontrados.push(childSnapshot.key);
                                            }
                                        }
                                    }
                                }
                            });
                        }
                    }
                );
            }

        }
        //verifica se é para pesquisa no atores
        if (pesquisarEmAtores) {
            for (var j = 0; j < palavrasChaves.length; j++) {
                firebase.database().ref('videos').orderByChild('palavrasChaveAtores-' + palavrasChaves[j]).equalTo(true).on('value',
                    (snapshot) => {
                        //verifica se videos foram encontrados
                        if (snapshot.val() != null) {
                            snapshot.forEach(function (childSnapshot) {
                                //verifica tempo minimo
                                if (tempoMinimo == null || childSnapshot.val().duracao >= tempoMinimo) {
                                    //verifica tempo maximo
                                    if (tempoMaximo == null || childSnapshot.val().duracao <= tempoMaximo) {
                                        //verifica ano
                                        if (ano == null || childSnapshot.val().ano === ano) {
                                            //verifica se tem mais de 30 videos encontrados e se o video ainda não foi adicionado
                                            if (listaIdVideosEncontrados.length < 30 && !listaIdVideosEncontrados.includes(childSnapshot.key)) {
                                                adicionarATela(childSnapshot.val(),childSnapshot.key);
                                                listaIdVideosEncontrados.push(childSnapshot.key);
                                            }
                                        }
                                    }
                                }
                            });
                        }
                    }
                );
            }

        }
        //verifica se é para pesquisa no responsavel
        if (pesquisarEmResponsavel) {
            firebase.database().ref('videos').orderByChild('responsavel').equalTo(textoParaPesquisa).on('value',
                (snapshot) => {
                    //verifica se videos foram encontrados
                    if (snapshot.val() != null) {
                        snapshot.forEach(function (childSnapshot) {
                            //verifica tempo minimo
                            if (tempoMinimo == null || childSnapshot.val().duracao >= tempoMinimo) {
                                //verifica tempo maximo
                                if (tempoMaximo == null || childSnapshot.val().duracao <= tempoMaximo) {
                                    //verifica ano
                                    if (ano == null || childSnapshot.val().ano === ano) {
                                        //verifica se tem mais de 30 videos encontrados e se o video ainda não foi adicionado
                                        if (listaIdVideosEncontrados.length < 30 && !listaIdVideosEncontrados.includes(childSnapshot.key)) {
                                            adicionarATela(childSnapshot.val(),childSnapshot.key);
                                            listaIdVideosEncontrados.push(childSnapshot.key);
                                        }
                                    }
                                }
                            }
                        });
                    }
                }
            );
        }
        //verifica se é para pesquisa no administradorCanal
        if (pesquisarEmAdministrador) {
            firebase.database().ref('videos').orderByChild('administradorCanal').equalTo(textoParaPesquisa).on('value',
                (snapshot) => {
                    //verifica se videos foram encontrados
                    if (snapshot.val() != null) {
                        snapshot.forEach(function (childSnapshot) {
                            //verifica tempo minimo
                            if (tempoMinimo == null || childSnapshot.val().duracao >= tempoMinimo) {
                                //verifica tempo maximo
                                if (tempoMaximo == null || childSnapshot.val().duracao <= tempoMaximo) {
                                    //verifica ano
                                    if (ano == null || childSnapshot.val().ano === ano) {
                                        //verifica se tem mais de 30 videos encontrados e se o video ainda não foi adicionado
                                        if (listaIdVideosEncontrados.length < 30 && !listaIdVideosEncontrados.includes(childSnapshot.key)) {
                                            adicionarATela(childSnapshot.val(),childSnapshot.key);
                                            listaIdVideosEncontrados.push(childSnapshot.key);
                                        }
                                    }
                                }
                            }
                        });
                    }
                }
            );
        }
        //verifica se é para pesquisa no canal
        if (pesquisarEmCanal) {
            for (var n = 0; n < palavrasChaves.length; n++) {
                firebase.database().ref('videos').orderByChild('palavrasChaveCanal-' + palavrasChaves[n]).equalTo(true).on('value',
                    (snapshot) => {
                        //verifica se videos foram encontrados
                        if (snapshot.val() != null) {
                            snapshot.forEach(function (childSnapshot) {
                                //verifica tempo minimo
                                if (tempoMinimo == null || childSnapshot.val().duracao >= tempoMinimo) {
                                    //verifica tempo maximo
                                    if (tempoMaximo == null || childSnapshot.val().duracao <= tempoMaximo) {
                                        //verifica ano
                                        if (ano == null || childSnapshot.val().ano === ano ) {
                                //verifica se tem mais de 30 videos encontrados e se o video ainda não foi adicionado
                                if (listaIdVideosEncontrados.length < 30 && !listaIdVideosEncontrados.includes(childSnapshot.key)) {
                                    adicionarATela(childSnapshot.val(),childSnapshot.key);
                                    listaIdVideosEncontrados.push(childSnapshot.key);
                                }}}}
                            });
                        }
                    }
                );
            }
        }
    }

    adicionarATela = (video, chaveVideo) => {
        const novoVideo = (
            <Link onClick={() => this.assistirVideo(video,chaveVideo)} to='/reproducao' className={classes.espacoVideo}>
                <img src={video.localizacaoImagem} width="100%" alt='' />
                <h4>{video.titulo}</h4>
                <p>{video.resumo}</p>
                <p style={{ marginBottom: "auto" }}><b>{video.canal}</b></p>
            </Link>
        );
        this.videos.push(novoVideo);
        this.setState({ gridVideos: React.createElement('div', { className: classes.gridContainer }, this.videos) });

    }

    assistirVideo = (video,chaveVideo) => {
        localStorage.setItem('telaReproducaoVideo', chaveVideo);
        localStorage.telaReproducaoVideoChave= chaveVideo;

    }

    render() {
        return (
            <div className={classes.body} >
                <div className={classes.menu}>
                    <img style={{ float: "left" }} className={classes.logoMiniaturaWhite} rel="icon" type="image/png" src={require("./img/logoMiniaturaWhite.png")} alt='' />
                    {/* <Link to=></Link> */}
                    <Link to="/principal" className={classes.linkToTelaPrincipal} ><b>Servidor IPTV</b></Link>
                    <Link to="/gerenciamentousuario" id='linkGerenciamentoUsuarios' style={{ visibility: 'hidden' }}><b><i className="fa fa-user-circle" aria-hidden="true"></i> Gerir Usuários</b></Link>
                    <Link to="/verificacaovideo" id='linkVerificacaoVideos' style={{ visibility: 'hidden' }}><b><i className="fa fa-file-video-o" aria-hidden="true"></i> Novos Vídeos</b></Link>
                    <button onClick={this.sair} style={{ float: "right" }}><b>{localStorage.nomeUsuario} </b><b>|</b><b> Sair</b> <i className="fa">&#xf08b;</i> </button>
                </div>
                <p style={{ textAlign: "center" }} id="fraseErro"></p>
                <div className={classes.search}>
                    <input type="text" className={classes.searchTerm} id='textoParaPesquisa' onKeyPress={this.pesquisar} placeholder="O que você esta procurando?" />
                    <button to="/pesquisa" onClick={this.pesquisar} type="submit" className={classes.searchButton}>
                        <i className="fa fa-search"></i>
                    </button>
                </div>
                <button className={classes.openbtn} onClick={this.filtros}>☰ Filtros</button>
                <div className={classes.menuWrapper}>
                    <div id="e" className={classes.sidebar}>
                        <div style={{ padding: "20px" }}>
                            <a href="/#"><b>Pesquisar em</b></a>
                            <label className={classes.container}>Título<input type="checkbox" id='pesquisarEmTitulo' defaultChecked="checked" /><span className={classes.checkmark}></span></label>
                            <label className={classes.container}>Resumo<input type="checkbox" id='pesquisarEmResumo' defaultChecked="checked" /><span className={classes.checkmark}></span></label>
                            <label className={classes.container}>Atores<input type="checkbox" id='pesquisarEmAtores' defaultChecked="checked" /><span className={classes.checkmark}></span></label>
                            <label className={classes.container}>Responsável<input type="checkbox" id='pesquisarEmResponsavel' defaultChecked="checked" /><span className={classes.checkmark}></span></label>
                            <label className={classes.container}>Administrador<input type="checkbox" id='pesquisarEmAdministrador' defaultChecked="checked" /><span className={classes.checkmark}></span></label>
                            <label className={classes.container}>Canal<input type="checkbox" id='pesquisarEmCanal' defaultChecked="checked" /><span className={classes.checkmark}></span></label>
                        </div>
                        <div style={{ padding: "20px" }}>
                            <a href="/#"><b>Duração (min)</b></a>
                            <div style={{ float: "left" }}>
                                <input className={classes.campoPesquisaFiltro} id='tempoMinimo' type="number" name="fromPrice" defaultValue="" placeholder="Mínimo" tabIndex="93" />
                            </div>
                            <div style={{ float: "right" }}>
                                <input className={classes.campoPesquisaFiltro} type="number" id='tempoMaximo' name="fromPrice" defaultValue="" placeholder="Máxima" tabIndex="93" />
                            </div>
                        </div>
                        <div style={{ padding: "20px" }}>
                            <a href="/#"><b>Ano</b></a>
                            <div style={{ float: "none" }}>
                                <input className={classes.campoPesquisaFiltro} type="number" id='ano' style={{ width: "50%" }} name="fromPrice" defaultValue="" placeholder="Ano" tabIndex="93" />
                            </div>
                        </div>
                    </div>
                </div>
                <div id="main" style={{ marginLeft: "0px" }}>
                    <div>
                        <h3 style={{ paddingLeft: "5%" }}>Resultados</h3>
                    </div>
                    {this.state.gridVideos}
                    {/*<div ref={this.gridVideos} className={classes.gridContainer}>
                        {this.state.videos}
                        <Link to="/reproducao" style={{ textDecoration: "none", textDecorationColor: "black", textDecorationStyle: "solid" }}>
                            <div className={classes.espacoVideo}>
                                <img src={require("./img/ED1.png")} width="100%" />
                                <h4>Título do video</h4>
                                <p>Resumo Lorem ipsum fames rutrum suspendisse curabitur, mollis netus curabitur convallis curabitur nisi, suscipit imperdiet aliquam volutpat. malesuada nisl non, felis. </p>
                                <p style={{ marginBottom: "auto" }}><b>Eletrônica Digital</b></p>
                            </div>
                        </Link>
                        <div className={classes.espacoVideo}>
                            <img src={require("./img/ED2.png")} width="100%" />
                            <h4>Título do video</h4>
                            <p>Resumo Lorem ipsum fames rutrum suspendisse curabitur, mollis netus curabitur convallis curabitur nisi, suscipit imperdiet aliquam volutpat. malesuada nisl non, felis. </p>
                            <p style={{ marginBottom: "auto" }}><b>Eletrônica Digital</b></p>
                        </div>
                        <div className={classes.espacoVideo}>
                            <img src={require("./img/LTR1.png")} width="100%" />
                            <h4>Título do video</h4>
                            <p>Resumo Lorem ipsum fames rutrum suspendisse curabitur, mollis netus curabitur convallis curabitur nisi, suscipit imperdiet aliquam volutpat. malesuada nisl non, felis. </p>
                            <p style={{ marginBottom: "auto" }}><b>LTR</b></p>
                        </div>
                        <div className={classes.espacoVideo}>
                            <img src={require("./img/LTR2.png")} width="100%" />
                            <h4>Título do video</h4>
                            <p>Resumo Lorem ipsum fames rutrum suspendisse curabitur, mollis netus curabitur convallis curabitur nisi, suscipit imperdiet aliquam volutpat. malesuada nisl non, felis. </p>
                            <p style={{ marginBottom: "auto" }}><b>LTR</b></p>
                        </div>
                        <div className={classes.espacoVideo}>
                            <img src={require("./img/IE1.png")} width="100%" />
                            <h4>Título do video</h4>
                            <p>Resumo Lorem ipsum fames rutrum suspendisse curabitur, mollis netus curabitur convallis curabitur nisi, suscipit imperdiet aliquam volutpat. malesuada nisl non, felis. </p>
                            <p style={{ marginBottom: "auto" }}><b>Instalações Eletricas</b></p>
                        </div>
                        <div className={classes.espacoVideo}>
                            <img src={require("./img/IE2.png")} width="100%" />
                            <h4>Título do video</h4>
                            <p>Resumo Lorem ipsum fames rutrum suspendisse curabitur, mollis netus curabitur convallis curabitur nisi, suscipit imperdiet aliquam volutpat. malesuada nisl non, felis. </p>
                            <p style={{ marginBottom: "auto" }}><b>Instalações Eletricas</b></p>
                        </div>
                        <div className={classes.espacoVideo}>
                            <img src={require("./img/RC1.png")} width="100%" />
                            <h4>Título do video</h4>
                            <p>Resumo Lorem ipsum fames rutrum suspendisse curabitur, mollis netus curabitur convallis curabitur nisi, suscipit imperdiet aliquam volutpat. malesuada nisl non, felis. </p>
                            <p style={{ marginBottom: "auto" }}><b>Redes de Computadores</b></p>
                        </div>
                        <div className={classes.espacoVideo}>
                            <img src={require("./img/RC2.png")} width="100%" />
                            <h4>Título do video</h4>
                            <p>Resumo Lorem ipsum fames rutrum suspendisse curabitur, mollis netus curabitur convallis curabiturnisi, suscipit imperdiet aliquam volutpat. malesuada nisl non, felis. </p>
                            <p style={{ marginBottom: "auto" }}><b>Redes de Computadores</b></p>
                        </div> 
                    </div>*/}
                </div>
                <Link to={this.state.url} id="linkSairPesquisa"></Link>
                <footer>
                    <p className={classes.rodape}>© 2020 Servidor IPTV</p>
                </footer>
            </div >
        );
    }
}

export default TelaPesquisa;