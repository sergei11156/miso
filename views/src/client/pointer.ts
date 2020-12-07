import { GameScene } from "./gameScene";

export default class Pointer {
  pointer: Phaser.Physics.Arcade.Sprite;
  platforms: Phaser.Physics.Arcade.Group;

  constructor(scene: GameScene, redzones: Phaser.Physics.Arcade.Group) {
    this.pointer = scene.physics.add.sprite(2000,400, "pointer");
    this.pointer.setCircle(10);
    this.pointer.alpha = 1;
    // scene.physics.add.collider(this.pointer, redzones, (object1, object2)=> {
    //   console.log("what the fuck");
      
    // })
    this.platforms = redzones;
  }

  setPosition(scene: GameScene, x: number, y: number, delta: number) {
    const centre = this.pointer.getCenter();
    this.pointer.setPosition(x, y);
    scene.physics.collide(this.pointer, this.platforms, (pointer, platform) => {
      const newCentre = this.pointer.getCenter();
      const deltaInSeconds = delta / 1000;
      const pointerSpeed = newCentre.clone().subtract(centre.clone());
      pointerSpeed.x /= deltaInSeconds;
      pointerSpeed.y /= deltaInSeconds;

      const platformSprite = (platform as Phaser.Physics.Arcade.Sprite);
      const platformCenter = platformSprite.getCenter();
      const direction = centre.clone().subtract(newCentre).normalize()

      const neededSpeed = pointerSpeed.multiply(direction);
      platformSprite.setVelocity(neededSpeed.x, neededSpeed.y);
      this.pointer.setPosition(centre.x, centre.y);
      console.log("collide");
      
    });
      
  }

}