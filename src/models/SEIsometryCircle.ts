import { SENodule } from "./SENodule";
import { SEPoint } from "./SEPoint";
import Circle from "@/plottables/Circle";
import { Vector3, Matrix4 } from "three";
import { Visitable } from "@/visitors/Visitable";
import { Visitor } from "@/visitors/Visitor";
import {
  NormalVectorAndTValue,
  ObjectState,
  OneDimensional,
  SEIsometry
} from "@/types";
import SETTINGS from "@/global-settings";
import {
  DEFAULT_CIRCLE_BACK_STYLE,
  DEFAULT_CIRCLE_FRONT_STYLE
} from "@/types/Styles";
import { Labelable } from "@/types";
import { SELabel } from "@/models/SELabel";
import { SEStore } from "@/store";
import { intersectCircles } from "@/utils/intersections";
import i18n from "@/i18n";
import ThreePointCircleCenter from "@/plottables/ThreePointCircleCenter";
import { SEThreePointCircleCenter } from "./SEThreePointCircleCenter";
import { SECircle } from "./SECircle";
import { SETranslation } from "./SETranslation";
import { SERotation } from "./SERotation";
import { SEReflection } from "./SEReflection";
import { SEPointReflection } from "./SEPointReflection";

export class SEIsometryCircle extends SECircle {
  /**
   * The parents of this SEIsometryCircle
   */
  private _seParentCircle: SECircle;
  private _seParentIsometry: SEIsometry;
  private transType = "";

  /**
   * Create a model SECircle using:
   * @param circ The plottable TwoJS Object associated to this object
   * @param centerPoint The model SEPoint object that is the center of the circle
   * @param circlePoint The model SEPoint object that is on the circle
   */
  constructor(
    circ: Circle,
    centerPoint: SEPoint,
    circlePoint: SEPoint,
    seParentCircle: SECircle,
    seParentIsometry: SEIsometry
  ) {
    super(circ, centerPoint, circlePoint);
    this._seParentCircle = seParentCircle;
    this._seParentIsometry = seParentIsometry;
    if (this._seParentIsometry instanceof SETranslation) {
      this.transType = i18n.tc("objects.translations", 3);
    } else if (this._seParentIsometry instanceof SERotation) {
      this.transType = i18n.tc("objects.rotations", 3);
    } else if (this._seParentIsometry instanceof SEReflection) {
      this.transType = i18n.tc("objects.reflections", 3);
    } else if (this._seParentIsometry instanceof SEPointReflection) {
      this.transType = i18n.tc("objects.pointReflections", 3);
    }
  }
  get parentCircle(): SECircle {
    return this._seParentCircle;
  }

  get parentIsometry(): SEIsometry {
    return this._seParentIsometry;
  }

  public get noduleDescription(): string {
    // "The image of {object} {name} under {transType} {trans}.",
    return String(
      i18n.t(`objectTree.transformationObject`, {
        object: i18n.tc(`objects.circles`, 3),
        name: this._seParentCircle.label?.ref.shortUserName,
        trans: this._seParentIsometry.name,
        transType: this.transType
      })
    );
  }

  public get noduleItemText(): string {
    return this.label?.ref.shortUserName ?? "No Label Short Name In SECircle";
  }

  public update(
    objectState?: Map<number, ObjectState>,
    orderedSENoduleList?: number[]
  ): void {
    // If any one parent is not up to date, don't do anything
    if (!this.canUpdateNow()) return;

    this.setOutOfDate(false);

    this._exists = this._seParentCircle.exists && this._seParentIsometry.exists;

    if (this._exists) {
      //update the centerVector and the radius
      const newRadius = this._centerSEPoint.locationVector.angleTo(
        this._circleSEPoint.locationVector
      );
      this.ref.circleRadius = newRadius;
      this.ref.centerVector = this._centerSEPoint.locationVector;
      // display the new circle with the updated values
      this.ref.updateDisplay();
    }

    if (this.showing && this._exists) {
      this.ref.setVisible(true);
    } else {
      this.ref.setVisible(false);
    }

    // These circles are completely determined by their point parents and an update on the parents
    // will cause this circle to be put into the correct location.So we don't store any additional information
    if (objectState && orderedSENoduleList) {
      if (objectState.has(this.id)) {
        console.log(
          `Isometry Circle with id ${this.id} has been visited twice proceed no further down this branch of the DAG.`
        );
        return;
      }
      orderedSENoduleList.push(this.id);
      objectState.set(this.id, { kind: "isometryCircle", object: this });
    }

    this.updateKids(objectState, orderedSENoduleList);
  }

  public isNonFreeCirle(): boolean {
    return true;
  }
}
