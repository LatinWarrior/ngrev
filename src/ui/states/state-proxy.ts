import { VisualizationConfig, Metadata } from '../../shared/formatters/data-format';
import { fork } from 'child_process';
import * as path from 'path';
import { IPCBus } from '../model/ipc-bus';
import { GetData, NextState, GetMetadata, PrevState } from '../model/ipc-constants';

export class StateProxy {
  private ipcBus: IPCBus = new IPCBus();
  private currentMetadata: Metadata;
  private currentData: VisualizationConfig<any>;
  private dataDirty = true;
  private _active: boolean;

  get active() {
    return this._active;
  }

  getData(): Promise<VisualizationConfig<any>> {
    this._active = true;
    if (this.dataDirty) {
      return this.ipcBus.send(GetData)
        .then(data => {
          this.dataDirty = false;
          this.currentData = data;
          return data;
        });
    } else {
      return Promise.resolve(this.currentData);
    }
  }

  nextState(id: string): Promise<void> {
    return this.ipcBus.send(NextState, id)
      .then(state => {
        this.dataDirty = true;
        return state;
      });
  }

  getMetadata(id: string): Promise<Metadata> {
    this.currentMetadata = null;
    return this.ipcBus.send(GetMetadata, id)
      .then(metadata => {
        this.currentMetadata = metadata;
        return metadata;
      })
  }

  prevState(): Promise<void> {
    return this.ipcBus.send(PrevState)
      .then(state => {
        this.dataDirty = true;
        return state;
      });
  }
}