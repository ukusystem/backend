import * as net from 'net';

let managerServer: net.Server | null = null;

function end(signal: NodeJS.Signals) {
  console.log(`Ending with signal ${signal}`);
  // Close server for managers
  managerServer?.close((err) => {
    if (err) {
      console.log(`Server for manager was not started.`);
    } else {
      console.log('Server for manager closed.');
    }
  });

  console.log(`End of controller service.`);
}

export function startServerForManager() {
  process.once('SIGINT', (signal) => {
    end(signal);
  });

  process.once('SIGTERM', (signal) => {
    end(signal);
  });

  process.once('SIGHUP', (signal) => {
    end(signal);
  });

  managerServer = net.createServer((connection) => {
    try {
      connection.setTimeout(30, () => {
        console.log('Manager idle timeout');
        // Activate when the manager sends keep alives to the server. Managers should not reconnect automaticaly
        // newManagerSocket.reconnect(this.selector)
      });

      connection.on('data', (data: Buffer) => {
        console.log(`Received '${data}'`);
        // newManagerSocket.addData(data);
      });

      connection.on('end', () => {
        console.log('Manager disconnected');
        // newManagerSocket.reconnect(this.selector);
      });

      // Triggers 'end' and 'close' events
      connection.on('error', () => {
        console.log('Manager error');
        // newManagerSocket.reconnect(this.selector);
      });

      connection.on('close', (hadError) => {
        console.log(`Manager closed. ${hadError ? 'With' : 'No'} error.`);
        // newManagerSocket.reconnect(this.selector);
      });

      console.log('Manager accepted and events set.');
    } catch {
      console.log('Error setting object for manager');
    }
  });

  managerServer.on('error', (e: any) => {
    console.log(`ERROR listening to managers. Code ${e.code}`);
  });

  const port = 10000;
  const ip = '172.16.0.72';
  managerServer.listen(port, ip, 16, () => {
    console.log(`Server for managers listening on ${ip}:${port}`);
  });
}
