import React from 'react';
import classes from "./css/gerenciamentoUsuario.module.css";
import { Link } from 'react-router-dom';
import firebase from "./autenticacao.js";
import { createBrowserHistory } from 'history';
import './css/EditProfile.css';

class EditUser extends React.Component {
  constructor(props) {
    super(props);
    this.state = { autenticacao: localStorage.autenticacao, usuario: JSON.parse(localStorage.getItem('@IPTV:UserToBeAltered')), newCanal: {}, newAdministratorStatus: { administradorUsuarios: JSON.parse(localStorage.getItem('@IPTV:UserToBeAltered')).administradorUsuarios }, autorizacao: { autorizacao: JSON.parse(localStorage.getItem('@IPTV:UserToBeAltered')).autorizacao } };
  }

  static getDerivedStateFromProps(props, state) {
    //procura usuario com localStorage.autenticacao igual ao seu id
    try {
      console.log(localStorage.autenticacao)
      firebase.database().ref('usuarios').orderByKey().equalTo(localStorage.autenticacao).on('value',
        (snapshot) => {
          //verifica se existe usuario
          if (snapshot.val() == null) {
            localStorage.setItem('autenticacao', JSON.stringify(null));
            createBrowserHistory({ forceRefresh: true }).push('/');
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

  sair = () => {
    localStorage.setItem('autenticacao', JSON.stringify(null));
    this.setState({ url: '/' });
    var linkSairGerenciamentoUsuario = document.getElementById("linkSairGerenciamentoUsuario");
    linkSairGerenciamentoUsuario.click();
  }

  updateUser = (e) => {
    e.preventDefault();
    const editedUser = Object.assign(
      this.state.usuario,
      this.state.newCanal,
      this.state.newAdministratorStatus,
      this.state.autorizacao,
    )

    firebase.database().ref(`usuarios/${this.state.usuario.userKey}`).update({
      ...editedUser
    })

    this.props.history.push('/gerenciamentousuario')
  }

  render() {
    return (
      <div className={classes.body}>
        <div className={classes.menu}>
          <img style={{ float: "left" }} height="43.5px" rel="icon" type="image/png" src={require("./img/logoMiniaturaWhite.png")} alt='' />
          <Link to="/principal" style={{ padding: 12.75 }}><b>Servidor IPTV</b></Link>
          <Link to="/gerenciamentousuario"><b><i className="fa fa-user-circle" aria-hidden="true"></i> Gerir Usuários</b></Link>
          <Link to="/verificacaovideo"><b><i className="fa fa-file-video-o" aria-hidden="true"></i> Novos Vídeos</b></Link>
          <button onClick={this.sair} style={{ float: "right" }}><b>{localStorage.nomeUsuario} </b><b>|</b><b> Sair</b> <i className="fa">&#xf08b;</i> </button>
        </div>

        <div className="profile">
          <img src={require("./img/people.jpg")} alt="profile" />
          <form onSubmit={this.updateUser} className="profile-form">
            <input type="text" value={this.state.usuario.nome} disabled name="nome" id="nome" />
            <input type="text" value={this.state.usuario.email} disabled name="email" id="email" />
            <input type="text" defaultValue={this.state.usuario.canal} onChange={e => this.setState({ newCanal: { canal: e.target.value } })} name="canal" id="canal" placeholder="Canal" />
            <div className="select-container">
              <div className="select">
                <label htmlFor="administrador">Administrador de Usuários</label>
                <select onChange={e => this.setState({ newAdministratorStatus: { administradorUsuarios: Number(e.target.value) } })} defaultValue={this.state.usuario.administradorUsuarios} id="administrador">
                  <option value="0">Não</option>
                  <option value="1">Sim</option>
                </select>
              </div>
              <div className="select">
                <label htmlFor="autorizacacao">Autorização de Acesso</label>
                <select onChange={e => this.setState({ autorizacao: { autorizacao: Number(e.target.value) } })} defaultValue={this.state.usuario.autorizacao} id="autorizacacao">
                  <option value="0">Não</option>
                  <option value="1">Sim</option>
                </select>
              </div>
            </div>
            <button type="submit">Salvar Alterações</button>
          </form>
        </div>
        <footer style={{ backgroundColor: "#a6ace4", height: "40px", textAlign: "center " }}>

          <p style={{ position: "absolute", width: "100%" }}>© 2020 Servidor IPTV</p>
        </footer>
      </div>
    );
  }
}
export default EditUser;