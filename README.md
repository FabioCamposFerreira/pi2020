# SERVIDOR E CLIENTE IPTV

Construção de uma
aplicação progressiva na web, instalável em qualquer dispositivo com navegador
instalado que tenha suporte a aplicativos PWA, ou seja, celulares, desktops, entres
outros. O aplicativo desenvolvido consegue realizar o login e cadastro de usuários,
bem como, depois de cadastrados, mudar seus privilégios de administradores,
podendo ou não gerenciar privilégios de outros usuários, ou permitir a inclusão de
novos vídeos no armazenamento do site. Sendo funções acessíveis na barra de
menus se os usuários tiverem estes privilégios. Depois de logado, o usuário é
direcionado para uma tela onde já é apresentado opções de vídeos disponíveis para
a visualização, como também a possibilidade de pesquisa de vídeos utilizando várias
opções de filtragem. Na tela onde o vídeo é reproduzido, uma opção é apresentada
para o usuário recomendar um vídeo presente em seu dispositivo para ser um
complemento ao vídeo atualmente reproduzindo. Desta forma, o vídeo enviado, se
aprovado pelo usuário com privilégios de gerenciamento de vídeos, será apresentado
como uma sequência do vídeo anteriormente já presente no sistema do site.

## Getting Started

Para executar este código  é necessário, antes de cloná-lo, instalar certas aplicações pela linha de comando. Sendo o Node.js e o gerenciador de arquivos npm.

### Prerequisites

*Node (v8.10.0)
*npm (3.5.2)

### Installing

A instalação é um processo, sequencial de linhas de comandos, sendo o primeiro

* npm install -g create-react-app

que cria uma estrutura de pasta genérica de projeto React. Na pasta "create-react-app", segundo comando executado é 

* npm install --save react-router-dom

para adicionar uma biblioteca que permite a mudança entre telas. O terceiro e ultimo comando é 

* npm install --save firebase

que adiciona a biblioteca Firebase ao projeto, permitindo a utilização deste banco de dados.
Finalmente, deve-se baixar este o código e substituir os arquivos no projeto recém criado.

## Running the tests

O código pode ser testado usando, na pasta raiz, o comando

* npm start

que irá executar o aplicativo em http://localhost:3000/

## Deployment

A compilação do código poderá ser realizada executando o comando

* npm run build

que irá armazenar os arquivos criados, totalmente no formato html, css e js, na pasta "build" na pasta raiz. Estes arquivos é que são utilizados no servidor online para o acesso pela internet do PWA.

## Authors

* **FÁBIO CAMPOS FERREIRA**
* **TIAGO MOREIRA CARNEIRO**
* **JOSÉ DAVID VARGAS DE MELO NETO**
