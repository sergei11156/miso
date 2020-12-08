import Dude from "./Dude";
import { GameScene } from "./gameScene";
import { gameSceneFromClient, gameSceneFromServer, userList } from "./interfaces/gameSceneInterfaces";
import { userInputEvents } from "./interfaces/interfaces";
import Platform from "./Platform";
import RoomsScene from "./rooms/roomsScene";

export default class GameUI {
  gameUI: HTMLDivElement;
  roomNameElement: HTMLDivElement;
  usersUlElement: HTMLUListElement;
  readyButton: HTMLButtonElement;
  quitRoomButton: NodeListOf<HTMLButtonElement>;
  io: SocketIOClient.Socket;
  scene: GameScene;
  underUsers: HTMLDivElement;
  private notEnouthPlayersText = false

  constructor(io: SocketIOClient.Socket, scene: GameScene, roomName: string) {
    this.io = io;
    this.scene = scene;
    this.gameUI = document.querySelector(".gameUi");
    this.gameUI.style.display = "block";
    this.roomNameElement = document.querySelector(".roomName");
    this.usersUlElement = document.querySelector(".users");
    this.readyButton = document.querySelector(".readyButton");
    this.quitRoomButton = document.querySelectorAll(".quitRoomButton");
    this.underUsers = document.querySelector(".underUsers");
    this.roomNameElement.textContent = "Комната: " + roomName;
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
        scene.scene.add("roomsScene", RoomsScene, true);
        scene.scene.remove("gameScene");
      });
    });

    this.io.on(gameSceneFromServer.userList, (params: userList) => {
      this.createUsersList(params);
    })

    this.io.on(gameSceneFromServer.gameStartTimerOn, () => {
      this.underUsers.textContent = "Большинство готовы, старт через "
    });
    this.io.on(gameSceneFromServer.gameStartTimerUpdate, (time: number) => {
      this.underUsers.textContent = "Большинство готовы, старт через " + time;
    }) 
    this.io.on(gameSceneFromServer.gameStartTimerOff, () => {
      if (this.notEnouthPlayersText) {
        return;
      } else {
        this.underUsers.textContent = "";
      }
    });

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
  gameEnd() {
    this.gameUI.style.display = "block";
  }
  gameStart() {
    this.gameUI.style.display = "none";
  }
  createUsersList(params: userList) {
    this.usersUlElement.innerHTML = "";
    for (const user of params.users) {
      let li = document.createElement("li");
      let liTextContainer = document.createElement("span");
      liTextContainer.classList.add("usersTextContainer")
      let nameContainer = document.createElement("span");
      nameContainer.textContent = user.name;
      liTextContainer.appendChild(nameContainer)
      let statusContainer = document.createElement("span");
      if (user.statusReady) {
        statusContainer.textContent = "готов"
        statusContainer.classList.add("ready")
      } else {
        statusContainer.textContent = "не готов"
        statusContainer.classList.add("notready")
      }
      liTextContainer.appendChild(statusContainer)
      li.appendChild(liTextContainer)
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
}