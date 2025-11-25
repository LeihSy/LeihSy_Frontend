import { Injectable } from '@angular/core';
import { mockDevices } from '../data/mock-data';
import { Device } from '../interfaces/device.model';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  private devices: Device[] = mockDevices;

  constructor() { }

  getDevices(): Device[] {
    return this.devices;
  }

  getDeviceById(id: string): Device | undefined {
    return this.devices.find(d => d.id === id);
  }
}
