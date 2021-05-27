import Two from "two.js";
import Highlighter from "./Highlighter";
import { SEPoint } from "@/models/SEPoint";
import { SENodule } from "@/models/SENodule";
import { AddExpressionCommand } from "@/commands/AddExpressionCommand";
import { SESegmentDistance } from "@/models/SESegmentDistance";
import EventBus from "@/eventHandlers/EventBus";
import { SEIntersectionPoint } from "@/models/SEIntersectionPoint";

export default class PointDistantHandler extends Highlighter {
  /**
   * Points to measure distance
   */
  private targetPoints: SEPoint[] = [];

  constructor(layers: Two.Group[]) {
    super(layers);
  }

  mousePressed(event: MouseEvent): void {
    //Select an object to delete
    if (this.isOnSphere) {
      const possibleTargetPointList = this.hitSEPoints.filter(
        p => !(p instanceof SEIntersectionPoint && !p.isUserCreated)
      );
      if (possibleTargetPointList.length > 0) {
        const pos = this.targetPoints.findIndex(
          (p: SEPoint) => p.id === possibleTargetPointList[0].id
        );
        if (pos >= 0) {
          EventBus.fire("show-alert", {
            key: `handlers.duplicatePointMessage`,
            keyOptions: {},
            type: "warning"
          });
          return;
        }
        this.targetPoints.push(possibleTargetPointList[0]);
      }

      if (this.targetPoints.length === 2) {
        const distanceMeasure = new SESegmentDistance(
          this.targetPoints[0],
          this.targetPoints[1]
        );
        EventBus.fire("show-alert", {
          key: `handlers.newMeasurementAdded`,
          keyOptions: { name: `${distanceMeasure.name}` },
          type: "success"
        });
        new AddExpressionCommand(distanceMeasure, [
          this.targetPoints[0],
          this.targetPoints[1]
        ]).execute();
        this.targetPoints.splice(0);
        // this.targetSegment = null;
      } else
        EventBus.fire("show-alert", {
          key: `handlers.selectAnotherPoint`,
          keyOptions: {},
          type: "info"
        });
    }
  }

  mouseMoved(event: MouseEvent): void {
    // Find all the nearby (hitSE... objects) and update location vectors
    super.mouseMoved(event);

    // Glow only the first SEPoint (must be user created)
    this.hitSEPoints.filter(
      p => !(p instanceof SEIntersectionPoint && !p.isUserCreated)
    )[0].glowing = true;
  }

  // eslint-disable-next-line
  mouseReleased(event: MouseEvent): void {}

  mouseLeave(event: MouseEvent): void {
    super.mouseLeave(event);
    // Reset the targetSegment in preparation for another deletion.
    this.targetPoints.clear();
  }

  activate(): void {
    if (this.store.getters.selectedSENodules().length == 2) {
      const object1 = this.store.getters.selectedSENodules()[0];
      const object2 = this.store.getters.selectedSENodules()[1];

      if (object1 instanceof SEPoint && object2 instanceof SEPoint) {
        const distanceMeasure = new SESegmentDistance(object1, object2);

        EventBus.fire("show-alert", {
          text: `New measurement ${distanceMeasure.name} added`,
          type: "success"
        });
        new AddExpressionCommand(distanceMeasure, [object1, object2]).execute();
      }
    }
    //Unselect the selected objects and clear the selectedObject array
    super.activate();
  }
  deactivate(): void {
    super.deactivate();
  }
}