import { Server } from "socket.io";
import { SocketAlarm } from "./alarm.types";
import { AlarmManager, AlarmSocketObserver } from "./alarm.manager";

export const alarmSocket = (io: Server, socket: SocketAlarm) => {
  // Namespace : /alarm_notification

  const observer = new AlarmSocketObserver(socket);
  AlarmManager.registerObserver(observer);

  const initialData = AlarmManager.getInitialData();

  socket.emit("initial_data",initialData);

  socket.on("disconnect", () => {
    const clientsCount = io.of(`/alarm_notification`).sockets.size;
    if (clientsCount == 0) {
      AlarmManager.unregisterObserver();
    }
  });
};
