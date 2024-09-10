import { ControllerStateManager, SidebarNavManager } from "../../controllers/socket";
import { Region } from "../../types/db";

export class RegionNotifyManager {
  static #notifyUpdateSidebarNav( curRegion: Region, fieldsUpdate: Partial<Region> ) {
    const { region } = fieldsUpdate;
    if (region !== undefined && curRegion.region !== region) {
      SidebarNavManager.notifyUpdateRegion(curRegion.rgn_id);
    }
  }

  static #notifyUpdateControllerState(curRegion: Region, fieldsUpdate: Partial<Region>){
    const { region } = fieldsUpdate;
    if (region !== undefined && curRegion.region !== region) {
        ControllerStateManager.notifyUpdateRegion(curRegion.rgn_id);
    }
  }
  static update(curRegion: Region, fieldsUpdate: Partial<Region>) {
    // sidebar_nav
    RegionNotifyManager.#notifyUpdateSidebarNav(curRegion, fieldsUpdate);
    
    // ControllerState
    RegionNotifyManager.#notifyUpdateControllerState(curRegion, fieldsUpdate);
  }
}