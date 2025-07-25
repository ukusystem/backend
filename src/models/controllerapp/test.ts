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
    // const rsp = connection.write(Buffer.from('+CMT: "+51948770239"\r\n^692&0&admin|\r\n'), () => {
    //   console.log('All written');
    // });
    // console.log(`Result: ${rsp}`);
    try {
      connection.setTimeout(30, () => {
        console.log('Manager idle timeout');
        // Activate when the manager sends keep alives to the server. Managers should not reconnect automaticaly
      });

      connection.on('data', (data: Buffer) => {
        console.log(`Received '${data}'`);
      });

      connection.on('end', () => {
        console.log('Manager disconnected');
      });

      // Triggers 'end' and 'close' events
      connection.on('error', () => {
        console.log('Manager error');
      });

      connection.on('close', (hadError) => {
        console.log(`Manager closed. ${hadError ? 'With' : 'No'} error.`);
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
