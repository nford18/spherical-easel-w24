import { SENodule } from "./SENodule";
import { SEPoint } from "./SEPoint";
import Ellipse from "@/plottables/Ellipse";
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
  DEFAULT_ELLIPSE_BACK_STYLE,
  DEFAULT_ELLIPSE_FRONT_STYLE
} from "@/types/Styles";
import { Labelable } from "@/types";
import { SELabel } from "@/models/SELabel";
import { SEStore } from "@/store";
import i18n from "@/i18n";
import { SECircle } from "./SECircle";
import { SEEllipse } from "./SEEllipse";
import { SETranslation } from "./SETranslation";
import { SERotation } from "./SERotation";
import { SEReflection } from "./SEReflection";
import { SEPointReflection } from "./SEPointReflection";

export class SEIsometryEllipse extends SEEllipse {
  /**
   * The parents of this SEIsometryEllipse
   */
  private _seParentEllipse: SEEllipse;
  private _seParentIsometry: SEIsometry;
  private transType = "";

  /**
   * Create a model SEEllipse using:
   * @param ellipse The plottable TwoJS Object associated to this object
   * @param focus1Point The model SEPoint object that is one of the foci of the ellipse
   * @param focus2Point The model SEPoint object that is one of the foci of the ellipse
   * @param ellipsePoint The model SEPoint object that is on the circle
   */
  constructor(
    ellipse: Ellipse,
    focus1Point: SEPoint,
    focus2Point: SEPoint,
    ellipsePoint: SEPoint,
    seParentEllipse: SEEllipse,
    seParentIsometry: SEIsometry
  ) {
    super(ellipse, focus1Point, focus2Point, ellipsePoint);
    this._seParentEllipse = seParentEllipse;
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
  get parentEllipse(): SEEllipse {
    return this._seParentEllipse;
  }

  get parentIsometry(): SEIsometry {
    return this._seParentIsometry;
  }

  public get noduleDescription(): string {
    // "The image of {object} {name} under {transType} {trans}.",
    return String(
      i18n.t(`objectTree.transformationObject`, {
        object: i18n.tc(`objects.ellipses`, 3),
        name: this._seParentEllipse.label?.ref.shortUserName,
        trans: this._seParentIsometry.name,
        transType: this.transType
      })
    );
  }

  public get noduleItemText(): string {
    return (
      this.label?.ref.shortUserName ??
      "No Label Short Name In SEIsometryEllipse"
    );
  }

  public update(
    objectState?: Map<number, ObjectState>,
    orderedSENoduleList?: number[]
  ): void {
    // If any one parent is not up to date, don't do anything
    if (!this.canUpdateNow()) return;

    this.setOutOfDate(false);

    this._exists =
      this._seParentEllipse.exists && this._seParentIsometry.exists;

    if (this._exists) {
      //update the a and b values, the focus vectors are already updated because the focusSEPoint are already updated if we have reach this point in the code
      this.a = this._seParentEllipse.a;
      this.b = this._seParentEllipse.b;
      this.ref.a = this._seParentEllipse.a;
      this.ref.b = this._seParentEllipse.b;
      this.ref.focus1Vector = this.focus1SEPoint.locationVector;
      this.ref.focus2Vector = this.focus2SEPoint.locationVector;
      // display the new ellipse with the updated values
      this.ref.updateDisplay();
    }

    if (this.showing && this._exists) {
      this.ref.setVisible(true);
    } else {
      this.ref.setVisible(false);
    }

    // These ellipse are completely determined by their point parents and an update on the parents
    // will cause this ellipse to be put into the correct location.So we don't store any additional information
    if (objectState && orderedSENoduleList) {
      if (objectState.has(this.id)) {
        console.log(
          `IsometryEllipse with id ${this.id} has been visited twice proceed no further down this branch of the DAG.`
        );
        return;
      }
      orderedSENoduleList.push(this.id);
      objectState.set(this.id, { kind: "isometryEllipse", object: this });
    }

    this.updateKids(objectState, orderedSENoduleList);
  }

  public isNonFreeEllipse(): boolean {
    return true;
  }
}
