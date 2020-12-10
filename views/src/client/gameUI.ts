import Dude from "./Dude";
import { GameScene } from "./gameScene";
import {
  gameSceneFromClient,
  gameSceneFromServer,
  userList,
  youDieWithScore,
} from "./interfaces/gameSceneInterfaces";
import { userInputEvents } from "./interfaces/interfaces";
import Platform from "./Platform";
import RoomsScene from "./rooms/roomsScene";

export default class GameUI {
  gameUI: HTMLDivElement;
  roomNameElement: NodeListOf<HTMLDivElement>;
  usersUlElement: HTMLUListElement;
  readyButton: HTMLButtonElement;
  quitRoomButton: NodeListOf<HTMLButtonElement>;
  io: SocketIOClient.Socket;
  scene: GameScene;
  underUsers: HTMLDivElement;
  private notEnouthPlayersText = false;
  gameEndElement: HTMLDivElement;
  gameEndAppearAnimContainer: HTMLDivElement;
  gameEndScore: HTMLElement;
  gameEndUnderScore: HTMLDivElement;
  gameEndBackToTheGame: HTMLDivElement;
  gameEndList: HTMLUListElement;
  onGameStartAgainButtonClick: () => void;

  constructor(io: SocketIOClient.Socket, scene: GameScene, roomName: string, isGameStarted: boolean) {
    this.io = io;
    this.scene = scene;
    this.gameUI = document.querySelector(".gameUi");
    this.gameUI.style.display = "block";
    this.roomNameElement = document.querySelectorAll(".roomName");

    this.roomNameElement.forEach((e) => {
      e.textContent = "Комната: " + roomName;
      e.addEventListener("click", () => {
        copyTextToClipboard(roomName);
        e.classList.add("copied");
        setTimeout(() => {
          e.classList.remove("copied")
        }, 1000)
      });
    });

    this.usersUlElement = document.querySelector(".users");
    this.readyButton = document.querySelector(".readyButton");
    this.quitRoomButton = document.querySelectorAll(".quitRoomButton");
    this.underUsers = document.querySelector(".underUsers");

    this.gameEndElement = document.querySelector(".gameEnd");
    this.gameEndAppearAnimContainer = this.gameEndElement.querySelector(
      ".appearAnimationContainer"
    );
    this.gameEndScore = this.gameEndElement.querySelector(".score");
    this.gameEndUnderScore = this.gameEndElement.querySelector(".underScore");
    this.gameEndList = this.gameEndElement.querySelector(".usersListWithScore");
    this.gameEndBackToTheGame = this.gameEndElement.querySelector(
      ".backToTheGame"
    );

    this.setButtonReadyState(false);
    this.readyButton.addEventListener("click", () => {
      if (!scene.ready) {
        this.setButtonReadyState(true);
        this.io.emit(userInputEvents.ready);
      } else {
        this.setButtonReadyState(false);
        this.io.emit(gameSceneFromClient.imNotReady);
      }
    });

    this.quitRoomButton.forEach((el) => {
      el.addEventListener("click", () => {
        this.io.disconnect();
        Dude.reset();
        Platform.reset();
        this.gameUI.style.display = "none";
        this.closeGameEndUI();
        scene.scene.add("roomsScene", RoomsScene, true);
        scene.scene.remove("gameScene");
      });
    });

    this.io.on(gameSceneFromServer.userList, (params: userList) => {
      this.createUsersList(params);
    });

    this.io.on(gameSceneFromServer.gameStartTimerOn, () => {
      this.underUsers.textContent = "Большинство готовы, старт через ";
    });
    this.io.on(gameSceneFromServer.gameStartTimerUpdate, (time: number) => {
      this.underUsers.textContent = "Большинство готовы, старт через " + time;
    });
    this.io.on(gameSceneFromServer.gameStartTimerOff, () => {
      if (this.notEnouthPlayersText) {
        return;
      } else {
        this.underUsers.textContent = "";
      }
    });

    this.io.on(
      gameSceneFromServer.youDieWithScore,
      (params: youDieWithScore) => {
        this.gameEnd(params.score);
      }
    );

    this.io.on(gameSceneFromServer.victory, () => {
      this.gameEnd(1);
    });

    this.io.on(gameSceneFromServer.userListWithPoints, (params: userList) => {
      this.userListWithPointUpdate(params);
    });

    this.onGameStartAgainButtonClick = () => {
      this.closeGameEndUI();
      setTimeout(() => {
        this.setButtonReadyState(true);
        this.io.emit(userInputEvents.ready);
      }, 700);
    };
    
    if (isGameStarted) {
      this.openGameEndUI();
    }
  }
  userListWithPointUpdate(usersList: userList) {
    console.log(usersList);

    this.gameEndList.innerHTML = "";

    let users = usersList.users;
    users.sort((a, b) => {
      if (!a.points) {
        return 1;
      }
      if (!b.points) {
        return -1;
      }
      return a.points - b.points;
    });
    for (const user of users) {
      const userScoreText = document.createElement("li");
      const nameAndScore = document.createElement("span");
      let text = user.name;
      if (user.points) {
        text = user.points + ". " + text;
      } else {
        text = "?? " + text;
      }
      nameAndScore.textContent = text;

      userScoreText.appendChild(nameAndScore);
      userScoreText.appendChild(this.generateStatusSpan(user.statusReady))
      this.gameEndList.appendChild(userScoreText);
    }

    if (usersList.canStartNewGame) {
      this.gameEndBackToTheGame.classList.add("readyToStart");
      this.gameEndBackToTheGame.classList.remove("notReadyToStart");
      this.gameEndBackToTheGame.addEventListener(
        "click",
        this.onGameStartAgainButtonClick
      );
    } else {
      this.gameEndBackToTheGame.classList.add("notReadyToStart");
      this.gameEndBackToTheGame.classList.remove("readyToStart");
      this.gameEndBackToTheGame.removeEventListener(
        "click",
        this.onGameStartAgainButtonClick
      );
    }
  }

  setButtonReadyState(state: boolean) {
    this.scene.ready = state;
    if (this.scene.ready) {
      this.readyButton.textContent = "НЕ ГОТОВ";
      this.readyButton.classList.remove("ready");
      this.readyButton.classList.add("notready");
    } else {
      this.readyButton.textContent = "ГОТОВ!";
      this.readyButton.classList.add("ready");
      this.readyButton.classList.remove("notready");
    }
  }
  gameEnd(score: number) {
    this.gameEndScore.textContent = "#" + score;

    if (score == 1) {
      this.gameEndUnderScore.textContent = "Вы победили!";
    } else {
      this.gameEndUnderScore.textContent = "У вас " + score + " место. ";
    }

    this.scene.gameStop();
    this.openGameEndUI();

    this.gameUI.style.display = "block";
  }
  openGameEndUI() {
    this.gameEndElement.style.visibility = "visible";
    this.gameEndAppearAnimContainer.style.maxHeight = "100%";
    this.gameEndAppearAnimContainer.style.maxWidth = "100%";
    this.gameEndAppearAnimContainer.style.borderRadius = "0";
  }
  closeGameEndUI() {
    this.gameEndElement.style.visibility = "";
    this.gameEndAppearAnimContainer.style.maxHeight = "";
    this.gameEndAppearAnimContainer.style.maxWidth = "";
    this.gameEndAppearAnimContainer.style.borderRadius = "";
  }
  gameStart() {
    this.gameUI.style.display = "none";
    this.closeGameEndUI();
  }
  createUsersList(params: userList) {
    this.usersUlElement.innerHTML = "";
    for (const user of params.users) {
      let li = document.createElement("li");
      let liTextContainer = document.createElement("span");
      liTextContainer.classList.add("usersTextContainer");
      let nameContainer = document.createElement("span");
      nameContainer.textContent = user.name;
      liTextContainer.appendChild(nameContainer);
      let statusContainer = this.generateStatusSpan(user.statusReady);
      liTextContainer.appendChild(statusContainer);
      li.appendChild(liTextContainer);
      this.usersUlElement.appendChild(li);
    }
    if (!this.notEnouthPlayersText && params.users.length < 2) {
      this.notEnouthPlayersText = true;
      this.underUsers.textContent = "Нельзя начать одному, ожидание игроков";
    }
    if (this.notEnouthPlayersText && params.users.length > 1) {
      this.notEnouthPlayersText = false;
      this.underUsers.textContent = "";
    }
  }

  generateStatusSpan(status: "play" | "ready" | "notready") {
    let statusContainer = document.createElement("span");
    switch (status) {
      case "play":
        statusContainer.textContent = "играет";
        statusContainer.classList.add("ready");
        break;
      case "ready":
        statusContainer.textContent = "готов";
        statusContainer.classList.add("ready");
        break;
      case "notready":
        statusContainer.textContent = "не готов";
        statusContainer.classList.add("notready");
    }
    return statusContainer
  }
}



function fallbackCopyTextToClipboard(text: string) {
  var textArea = document.createElement("textarea");
  textArea.value = text;
  
  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    console.log('Fallback: Copying text command was ' + msg);
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }

  document.body.removeChild(textArea);
}
function copyTextToClipboard(text: string) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(function() {
    console.log('Async: Copying to clipboard was successful!');
  }, function(err) {
    console.error('Async: Could not copy text: ', err);
  });
}
