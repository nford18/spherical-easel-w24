import { Command } from "./Command";
import { Matrix4 } from "three";

export class RotateSphereCommand extends Command {
  private rotationMat: Matrix4;
  private inverseRotation: Matrix4;
  constructor(rotationMatrix: Matrix4) {
    super();
    this.rotationMat = rotationMatrix.clone();
    this.inverseRotation = new Matrix4();
    this.inverseRotation.getInverse(this.rotationMat);
  }

  do(): void {
    Command.store.commit("rotateSphere", this.rotationMat);
  }

  saveState(): void {
    // No work required here
  }

  restoreState(): void {
    Command.store.commit("rotateSphere", this.inverseRotation);
  }
}