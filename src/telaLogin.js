import React from 'react';
import classes from "./css/login.module.css";
import { Link } from 'react-router-dom';
import firebase from "./autenticacao.js";
import { createBrowserHistory } from 'history';


class TelaLogin extends React.Component {
  constructor(props) {
    super(props);
    this.state = { url: '/' };
    // this.linkLogin = React.createRef();
  }
  // handleChangeNomeInput =(event)=>{
  //   console.log('mudou!');
  //   this.setState({nomeInput:event.target.value});
  // }

  static getDerivedStateFromProps(props, state) {
    //procura usuario com localStorage.autenticacao igual ao seu id
    try {
      firebase.database().ref('usuarios').orderByKey().equalTo(localStorage.autenticacao).on('value',
        (snapshot) => {
          //verifica se existe usuario
          if (snapshot.val() != null) {
            createBrowserHistory({ forceRefresh: true }).push('/principal');
          }
        }
      );
    } catch (error) {
      // executado quando localStorage.autenticacao é indefinido
      localStorage.autenticacao = null;
    }
    return null;
  }

  clickLinkLogin = () => {
    var linkSairLogin = document.getElementById("linkSairLogin");
    linkSairLogin.click();
  }
  entrar = () => {
    // lida com a chamada da tag Link antes da construção do DOM, evitando erro
    try {
      var email = document.getElementById("emailInput").value;
      var senha = document.getElementById("passwordInput").value;
      var erro = document.getElementById("fraseErro");
      //verifica se tem texto nos campos
      if (email !== '' && senha !== '') {
        firebase.database().ref('usuarios').orderByChild('email').equalTo(email).on('value',
          (snapshot) => {
            //verifica se o usuario é cadastrado
            if (snapshot.val() == null) {
              erro.style.color = "red";
              erro.innerHTML = "Usuario não encontrado!";
              this.setState({ url: "/" });
            }
            else {
              snapshot.forEach(
                (childSnapshot) => {
                  if (childSnapshot.val().autorizacao != 0) {
                    //verifica senha
                    if (childSnapshot.val().senha === senha) {
                      localStorage.setItem('nomeUsuario', childSnapshot.val().nome);
                      localStorage.setItem('autenticacao', childSnapshot.key);
                      this.setState({ url: "/principal" }, this.clickLinkLogin);
                    }
                    else {
                      erro.style.color = "red";
                      erro.innerHTML = "Senha incorreta!";
                      this.setState({ url: "/" });
                    }
                  } else {
                    erro.style.color = "red";
                    erro.innerHTML = 'Você ainda não esta autorizado!';
                  }
                });
            }
          });
        console.log("antes do fim do firebase = " + this.state.url);
      }
      else {
        erro.style.color = "red";
        erro.innerHTML = 'Campos vazios!';
      }
    }
    catch (err) {
      console.log(err);
    }
  }

  criarConta() {
    var nome = document.getElementById("nomeInput");
    var email = document.getElementById("emailInput").value;
    var senha = document.getElementById("passwordInput").value;
    var erro = document.getElementById("fraseErro");
    if (nome.style.visibility !== 'hidden') {
      // verifica se todos os campos estão preenchidos
      if (nome.value !== '' && email !== '' && senha !== '') {
        //defini nome de usuario para mais de duas letras
        if (nome.value.length > 2) {
          //verificacao simples se o email é real
          if (email.includes("@") && email.includes(".com")) {
            //verificacao se a senha tem mais de 5 caracteres
            if (senha.length > 5) {
              firebase.database().ref('usuarios').orderByChild('email').equalTo(email).on('value', function (snapshot) {
                // verifica se o email ja foi cadastrado
                if (snapshot.val() == null) {
                  var data = { nome: nome.value, email: email, senha, autorizacao: 0, administradorUsuarios: 0, administradorCanal: "" };
                  firebase.database().ref().child('usuarios').push(data);
                  erro.style.color = "blue";
                  erro.innerHTML = "Cadastro criado com sucesso! Você poderá entrar depois de uma autorização manual.";
                }
              });
            }
            else {
              erro.style.color = "red";
              erro.innerHTML = 'A senha deve ter pelo menos 6 caracteres!';
            }
          }
          else {
            erro.style.color = "red";
            erro.innerHTML = 'E-mail invalido!';
          }
        }
        else {
          erro.style.color = "red";
          erro.innerHTML = 'O nome de usuário deve ter pelo menos 3 letras!';
        }
      }
      else {
        erro.style.color = "red";
        erro.innerHTML = 'Campos vazios!';
      }
    }
    else {
      nome.style.visibility = 'visible';
      erro.style.color = "red";
      erro.innerHTML = 'Não se esqueça do seu nome!';
    }
  }

  render() {
    return (
      <div className={classes.body}>
        <div className={classes.borda}>
          <br />
          <img className={classes.logo} src={require("./img/logo.png")} alt="Logo ServidorIPTV" />
          <h3 style={{ textAlign: "center" }}>Cliente Servidor IPTV</h3>
          <br />
          <p style={{ textAlign: "center" }} id="fraseErro"></p>
          <form>
            <div className="form-group">
              <input type="" className="form-control" id="nomeInput" style={{ maxWidth: "50%", margin: "auto", visibility: "hidden" }} placeholder="Nome" />
            </div>
            <div className="form-group">
              <input type="email" className="form-control" id="emailInput" style={{ maxWidth: "50%", margin: "auto" }} placeholder="E-mail" />
            </div>
            <div className="form-group">
              <input type="password" className="form-control" style={{ maxWidth: "50%", margin: "auto" }} id="passwordInput" placeholder="Senha" />
            </div>
          </form>
          <button className="btn btn-lg btn-block btn-primary" onClick={this.entrar} style={{ maxWidth: "50%", margin: "auto" }} id="authEmailPassButton">Entrar</button>
          <Link to={this.state.url} style={{ visibility: "hidden" }} id="linkSairLogin" ref={this.linkLogin}></Link>
          <br />
          <button className="btn btn-lg btn-block btn-info" onClick={this.criarConta} style={{ maxWidth: "50%", margin: "auto" }} id="createUserButton">Criar Nova Conta</button>
          <br />
        </div>
        {/* <footer style={{position:"fixed"}}>
        <p className={classes.footerP}> © 2020 Servidor IPTV</p >
      </footer > */}
      </div >
    );
  }
}

export default TelaLogin;

