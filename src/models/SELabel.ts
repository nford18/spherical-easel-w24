import Label from "../plottables/Label";
import { Visitable } from "@/visitors/Visitable";
import { Visitor } from "@/visitors/Visitor";
import { SENodule } from "./SENodule";
import { Vector3 } from "three";
import SETTINGS from "@/global-settings";
import { Styles } from "@/types/Styles";
import { UpdateMode, UpdateStateType, LabelState, Labelable } from "@/types";
import AppStore from "@/store";
import { SEPoint } from "./SEPoint";
import { SESegment } from "./SESegment";
import { SELine } from "./SELine";
import { SECircle } from "./SECircle";
import { SEAngleMarker } from "./SEAngleMarker";

const styleSet = new Set([
  Styles.fillColor,
  Styles.opacity,
  Styles.labelTextScalePercent,
  Styles.dynamicBackStyle,
  Styles.labelTextStyle,
  Styles.labelTextFamily,
  Styles.labelTextDecoration,
  Styles.labelTextRotation,
  Styles.labelDisplayCaption,
  Styles.labelDisplayText,
  Styles.labelDisplayMode,
  Styles.labelVisibility,
  Styles.objectVisibility
]);

export class SELabel extends SENodule implements Visitable {
  /* Access to the store to retrieve the canvas size so that the bounding rectangle for the text can be computed properly*/
  protected store = AppStore;

  /* This should be the only reference to the plotted version of this SELabel */
  public ref: Label;
  /**
   * The  parent of this SELabel
   */
  public parent: SENodule;
  /**
   * The vector location of the SEPoint on the ideal unit sphere
   */
  protected _locationVector = new Vector3();

  /**
   * Create a label of the parent object
   * @param label the TwoJS label associated with this SELabel
   * @param parent The parent SENodule object
   */
  constructor(label: Label, parent: SENodule) {
    super();

    this.ref = label;
    this.parent = parent;
    label.seLabel = this; // used so that Label (the plottable) can set the visibility of the parent
    ((this.parent as unknown) as Labelable).label = this;
    this.name = `LabelOf(${parent.name})`;
    // Set the initial names.
    label.initialNames = parent.name;
    // Set the size for zoom
    this.ref.adjustSize();

    // Display the label initially
    if (parent instanceof SEPoint) {
      if (parent.isFreePoint()) {
        this.showing = SETTINGS.point.showLabelsOfFreePointsInitially;
      } else {
        this.showing = SETTINGS.point.showLabelsOfNonFreePointsInitially;
      }
    } else if (parent instanceof SELine) {
      this.showing = SETTINGS.line.showLabelsInitially;
    } else if (parent instanceof SESegment) {
      this.showing = SETTINGS.segment.showLabelsInitially;
    } else if (parent instanceof SECircle) {
      this.showing = SETTINGS.circle.showLabelsInitially;
    } else if (parent instanceof SEAngleMarker) {
      this.showing = SETTINGS.angleMarker.showLabelsInitially;
    } else {
      this.showing = true;
    }
  }

  customStyles(): Set<Styles> {
    return styleSet;
  }

  /**
   * When undoing or redoing a move, we do *not* want to use the "set locationVector" method because
   * that will set the position on a potentially out of date object. We will trust that we do not need to
   * use the closest point method and that the object that this point depends on will be move under this point (if necessary)
   * @param pos The new position of the point
   */
  public labelDirectLocationSetter(pos: Vector3): void {
    // Record the location on the unit ideal sphere of this SEPoint
    this._locationVector.copy(pos).normalize();
    // Set the position of the associated displayed plottable Point
    this.ref.positionVector = this._locationVector;
  }

  accept(v: Visitor): void {
    v.actionOnLabel(this);
  }

  public update(state: UpdateStateType): void {
    //console.log("update label");
    // If any one parent is not up to date, don't do anything
    if (!this.canUpdateNow()) {
      return;
    }
    this.setOutOfDate(false);

    //These labels don't exist when their parent doesn't exist
    this._exists = this.parent.exists;
    if (this._exists) {
      this._locationVector = ((this
        .parent as unknown) as Labelable).closestLabelLocationVector(
        this._locationVector
      );
      //Update the location of the associate plottable Label (setter also updates the display)
      this.ref.positionVector = this._locationVector;
    }
    // Update visibility
    if (this._showing && this._exists) {
      this.ref.setVisible(true);
    } else {
      this.ref.setVisible(false);
    }

    // Record the state of the object in state.stateArray if necessary
    //#region saveState
    // Create a label state for a Move or delete if necessary
    if (
      state.mode == UpdateMode.RecordStateForDelete ||
      state.mode == UpdateMode.RecordStateForMove
    ) {
      // Store the coordinate values of the current location vector of the label.
      const labelState: LabelState = {
        kind: "label",
        locationVectorX: this._locationVector.x,
        locationVectorY: this._locationVector.y,
        locationVectorZ: this._locationVector.z,
        object: this
      };
      state.stateArray.push(labelState);
    }
    //#endregion saveState
    this.updateKids(state);
  }

  /**
   * Set or get the location vector of the SEPoint on the unit ideal sphere
   */
  set locationVector(pos: Vector3) {
    // Record the location on the unit ideal sphere of this SELabel
    // If the parent is not out of date, use the closest vector, if not set the location directly
    // and the program will update the parent later so that the set location is on the parent (even though it is
    // at the time of execution)
    if (!this.parent.isOutOfDate()) {
      this._locationVector
        .copy(
          ((this.parent as unknown) as Labelable).closestLabelLocationVector(
            pos
          )
        )
        .normalize();
    } else {
      this._locationVector.copy(pos);
    }
    // Set the position of the associated displayed plottable Label
    this.ref.positionVector = this._locationVector;
  }
  get locationVector(): Vector3 {
    return this._locationVector;
  }

  public isHitAt(
    unitIdealVector: Vector3,
    currentMagnificationFactor: number
  ): boolean {
    // First check to see if the label and the unitIdealVector are on the same side of the sphere
    if (unitIdealVector.z * this._locationVector.z < 0) return false;

    // Get the bounding box of the text
    const boundingBox = this.ref.boundingRectangle;
    // Get the canvas size so the bounding box can be corrected
    // console.log("SELabel.store.getters", this.store);
    const canvasSize = this.store.getters.getCanvasWidth();

    return (
      boundingBox.left - canvasSize / 2 <
        unitIdealVector.x * SETTINGS.boundaryCircle.radius &&
      unitIdealVector.x * SETTINGS.boundaryCircle.radius <
        boundingBox.right - canvasSize / 2 &&
      boundingBox.top - canvasSize / 2 <
        -unitIdealVector.y * SETTINGS.boundaryCircle.radius && // minus sign because text layers are not y flipped
      -unitIdealVector.y * SETTINGS.boundaryCircle.radius < // minus sign because text layers are not y flipped
        boundingBox.bottom - canvasSize / 2
    );
  }

  // I wish the SENodule methods would work but I couldn't figure out how
  // See the attempts in SENodule
  public isFreePoint(): boolean {
    return false;
  }
  public isOneDimensional(): boolean {
    return false;
  }
  public isPoint(): boolean {
    return false;
  }
  public isPointOnOneDimensional(): boolean {
    return false;
  }
  public isLabel(): boolean {
    return true;
  }
  public isSegmentOfLengthPi(): boolean {
    return false;
  }
  public isLabelable(): boolean {
    return false;
  }
}