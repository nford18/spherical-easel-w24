import { Vector3, Camera, Scene } from "three";
import LineHandler from "./LineHandler";
// import Arrow from "@/3d-objs/Arrow";
import Point from "@/3d-objs/Point";
import SETTINGS from "@/global-settings";
import Two from "two.js";

export default class SegmentHandler extends LineHandler {
  // private marker = new Point(5, 0xff0000);
  // private majorAxisDir = new Vector3();
  constructor(scene: Two) {
    super(scene, true /* segment of ine */);
    // this.marker.positionOnSphere = new Vector3(1.0, 0, 0);
    // this.canvas.add(this.marker);
    // const greenDot = new Point(0.05, 0x00ff44);
    // greenDot.position.set(0, 1.0, 0);
    // this.smallCircle.add(redDot);
    // this.smallCircle.add(greenDot);
  }

  // mouseMoved(event: MouseEvent) {
  //   super.mouseMoved(event);
  //   console.debug("Segment handler", this.isOnSphere);
  //   this.majorAxisDir
  //     .set(-this.line.normalDirection.y, this.line.normalDirection.x, 0)
  //     .normalize();
  //   this.marker.positionOnSphere = this.majorAxisDir;
  // }

  activate = () => {
    // this.rayCaster.layers.enable(SETTINGS.layers.sphere);
    // this.rayCaster.layers.enable(SETTINGS.layers.point);
    // The following line automatically calls Line setter function
    this.line.isSegment = true;
  };
}
