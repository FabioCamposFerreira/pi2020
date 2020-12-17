import React from 'react';
import { Link } from 'react-router-dom';
import classes from "./css/telaPrincipal.module.css";
import { createBrowserHistory } from 'history';
import firebase from "./autenticacao.js";



class TelaPrincipal extends React.Component {

  buscaVideo = () => {
    localStorage.textoVindoTelaPrincipal = document.getElementById("tituloInput").value;
  }

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
    var adicionarATela = this.adicionarATela;
    firebase.database().ref('videos').orderByChild('aprovado').equalTo(1).on('value', function (snapshot) {
      var videosrecomendados = snapshot.val();
      if (!videosrecomendados) {
        return
      }
      var keys = Object.keys(videosrecomendados);
      keys.reverse();
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        adicionarATela(videosrecomendados, k);
      }
    })
  }
  adicionarATela = (video, k) => {
    const novoVideo = (
      <Link onClick={() => this.assistirVideo(k)} to="/reproducao" className={classes.espacoVideo}>
        <img src={video[k].localizacaoImagem} style={{height:"200px", width:"100%"}} alt='' />
        <h4>{video[k].titulo}</h4>
        <p>{video[k].resumo}</p>
        <p style={{ marginBottom: "auto" }}><b>{video[k].canal}</b></p>
      </Link>
    );
    this.videos.push(novoVideo);
    this.setState({ gridVideos: React.createElement('div', { className: classes.gridContainer }, this.videos) });
  }

  assistirVideo = (chaveVideo) => {
    localStorage.setItem('telaReproducaoVideo', JSON.stringify(chaveVideo));
  }

  sair = () => {
    localStorage.autenticacao = null;
    this.setState({ url: '/' });
    var linkSairPrincipal = document.getElementById("linkSairPrincipal");
    linkSairPrincipal.click();
  }

  render() {
    return (
      <div className={classes.body}>
        <div className={classes.menu}>
          <img style={{ float: "left" }} src={require("./img/logoMiniaturaWhite.png")} rel="icon" type="image/png" height="43.5px" alt='' />
          <Link to="/principal" style={{ padding: "12.75px" }}><b>Servidor IPTV</b></Link>
          <Link to="/gerenciamentousuario" id='linkGerenciamentoUsuarios' style={{ visibility: 'hidden' }}><b><i className="fa fa-user-circle" aria-hidden="true"></i> Gerir Usuários</b></Link>
          <Link to="/verificacaovideo" id='linkVerificacaoVideos' style={{ visibility: 'hidden' }}><b><i className="fa fa-file-video-o" aria-hidden="true"></i> Novos Vídeos</b></Link>
          <button onClick={this.sair} style={{ float: "right" }}><b>{localStorage.nomeUsuario} </b><b>|</b><b> Sair</b> <i className="fa">&#xf08b;</i> </button>
        </div>

        <div className={classes.search}>
          <input type="text" className={classes.searchTerm} id='tituloInput' placeholder="O que você esta procurando?" />
          <Link type="submit" to="/pesquisa" className={classes.searchButton} onClick={this.buscaVideo}>
            <i className="fa fa-search"></i>
          </Link>

        </div>
        <div>
          <h3 className={classes.style5}>Recomendações</h3>
        </div>

        {this.state.gridVideos}

        <footer className={classes.style7}>
          <p className={classes.style8}>© 2020 Servidor IPTV</p>
        </footer>
      </div>
    );
  }
}
export default TelaPrincipal;
