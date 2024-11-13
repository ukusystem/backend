import pdfmake from 'pdfmake';
import { Response, NextFunction } from 'express';
import { asyncErrorHandler } from '../../../utils/asynErrorHandler';
import { TDocumentDefinitions, TableCell, UnorderedListElement } from 'pdfmake/interfaces';
import { Ticket } from '../../../models/ticket';
import dayjs from 'dayjs';
import type { RequestWithUser } from '../../../types/requests';
import { join } from 'node:path';
import { appConfig } from '../../../configs';

// PDF fonts:
const fonts = {
  Roboto: {
    normal: join(__dirname, '../../../../fonts/Roboto/Roboto-Regular.ttf'),
    bold: join(__dirname, '../../../../fonts/Roboto/Roboto-Bold.ttf'),
    italics: join(__dirname, '../../../../fonts/Roboto/Roboto-Italic.ttf'),
    bolditalics: join(__dirname, '../../../../fonts/Roboto/Roboto-BlackItalic.ttf'),
  },
  Courier: {
    normal: 'Courier',
    bold: 'Courier-Bold',
    italics: 'Courier-Oblique',
    bolditalics: 'Courier-BoldOblique',
  },
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique',
  },
  Times: {
    normal: 'Times-Roman',
    bold: 'Times-Bold',
    italics: 'Times-Italic',
    bolditalics: 'Times-BoldItalic',
  },
  Symbol: {
    normal: 'Symbol',
  },
  ZapfDingbats: {
    normal: 'ZapfDingbats',
  },
};

export const downloadPdfDetalles = asyncErrorHandler(async (req: RequestWithUser, res: Response, _next: NextFunction) => {
  const { ctrl_id, rt_id } = req.query as { ctrl_id: string; rt_id: string };
  const user = req.user!; // ! -> anteponer middleware auth
  const result = await Ticket.getAllTicketDetails({ ctrl_id: Number(ctrl_id), rt_id: Number(rt_id), user });

  if (result) {
    const { solicitante, ticket, personales, archivos_respaldo } = result;

    const personalesRows = personales.map((personal, index) => {
      const { nombre, telefono, dni, cargo, contrata, foto } = personal;
      const fotoFinal = foto
        ? {
            text: 'Ver',
            alignment: 'left',
            link: `http://${appConfig.server.ip}:${appConfig.server.port}/api/v1/ticket/download/fotoactividadpersonal?filePath=${encodeURIComponent(foto)}`,
            color: 'blue',
          }
        : 'Sin Foto';

      return [index + 1, nombre, telefono, dni, cargo, contrata, fotoFinal];
    });
    const personalesTableBody: TableCell[][] = [
      [
        { text: 'N°', bold: true, fontSize: 12, alignment: 'left' },
        {
          text: 'NOMBRE',
          bold: true,
          fontSize: 12,
          alignment: 'left',
        },
        {
          text: 'TELEFONO',
          bold: true,
          fontSize: 12,
          alignment: 'left',
        },
        { text: 'DNI', bold: true, fontSize: 12, alignment: 'left' },
        {
          text: 'CARGO',
          bold: true,
          fontSize: 12,
          alignment: 'left',
        },
        {
          text: 'CONTRATA',
          bold: true,
          fontSize: 12,
          alignment: 'left',
        },
        {
          text: 'FOTO',
          bold: true,
          fontSize: 12,
          alignment: 'left',
        },
      ],
      ...personalesRows,
    ];

    const listArchivosRespaldo: UnorderedListElement[] = archivos_respaldo.map((archivo) => {
      return {
        columns: [
          {
            width: 'auto',
            text: archivo.nombreoriginal,
          },
          {
            width: '*',
            text: 'Ver',
            alignment: 'right',
            link: `http://${appConfig.server.ip}:${appConfig.server.port}/api/v1/ticket/download/archivorespaldo?filePath=${encodeURIComponent(archivo.ruta)}`,
            color: 'blue',
          },
        ],
      };
    });

    const docDefinitionDetalles: TDocumentDefinitions = {
      content: [
        {
          columns: [
            {
              alignment: 'left',
              columns: [
                {
                  width: 40,
                  svg: '<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_318_552)"><path d="M60.9823 43.9359H72.7286C75.5251 54.1372 50.0746 92.1086 16.7931 64.3383L11.7589 68.8726C27.7005 87.8583 80 85.8743 80 36.5683H59.5834L56.7869 18.4328H50.0746L42.2437 42.8025L45.0405 52.1537L52.5917 33.1679L57.3463 58.6709H63.2194L60.9823 43.9359Z" fill="#549AEC"/><path d="M20.7086 36.5683H7.28406C7.28406 21.5498 31.0566 -9.62069 63.4989 15.8825L67.9737 11.3486C40.8453 -13.0211 -0.826577 3.69761 0.0124759 43.9359H19.3102L16.5134 58.1046H22.9459L27.7005 33.1679L36.9298 58.1046H42.803L30.2175 18.4328H23.5053L20.7086 36.5683Z" fill="#1668DC"/></g><defs><clipPath id="clip0_318_552"><rect width="80" height="80" fill="white"/></clipPath></defs></svg>',
                },
                {
                  text: 'Uku Systems',
                  alignment: 'left',
                  margin: [5, 10, 0, 0],
                  fontSize: 20,
                  bold: true,
                },
              ],
            },
            {
              alignment: 'right',
              margin: [0, 14, 0, 0],
              columns: [{ text: 'Fecha : ' }, { text: dayjs().format('DD/MM/YYYY HH:mm:ss'), opacity: 0.5 }],
              fontSize: 12,
            },
          ],
        },
        {
          table: {
            widths: ['*'],
            body: [
              [
                {
                  text: 'Solicitante',
                  bold: true,
                  fontSize: 15,
                  alignment: 'left',
                },
              ],
              [
                {
                  table: {
                    widths: ['*', '*'],
                    body: [
                      [
                        {
                          stack: [
                            {
                              text: 'Nombre : ',
                              bold: true,
                              alignment: 'left',
                            },
                            {
                              text: solicitante.nombre,
                              alignment: 'left',
                              opacity: 0.5,
                            },
                          ],
                          alignment: 'center',
                        },
                        {
                          stack: [
                            {
                              text: 'Telefono : ',
                              bold: true,
                              alignment: 'left',
                            },
                            {
                              text: solicitante.telefono,
                              alignment: 'left',
                              opacity: 0.5,
                            },
                          ],
                          alignment: 'center',
                        },
                      ],
                      [
                        {
                          stack: [
                            {
                              text: 'Correo : ',
                              bold: true,
                              alignment: 'left',
                            },
                            {
                              text: solicitante.correo,
                              alignment: 'left',
                              opacity: 0.5,
                            },
                          ],
                          alignment: 'center',
                        },
                        {
                          stack: [
                            {
                              text: 'DNI : ',
                              bold: true,
                              alignment: 'left',
                            },
                            {
                              text: solicitante.dni,
                              alignment: 'left',
                              opacity: 0.5,
                            },
                          ],
                          alignment: 'center',
                        },
                      ],
                      [
                        {
                          stack: [
                            {
                              text: 'Cargo : ',
                              bold: true,
                              alignment: 'left',
                            },
                            {
                              text: solicitante.cargo,
                              alignment: 'left',
                              opacity: 0.5,
                            },
                          ],
                          alignment: 'center',
                        },
                        {
                          stack: [
                            {
                              text: 'Contrata : ',
                              bold: true,
                              alignment: 'left',
                            },
                            {
                              text: solicitante.contrata,
                              alignment: 'left',
                              opacity: 0.5,
                            },
                          ],
                          alignment: 'center',
                        },
                      ],
                    ],
                  },
                  layout: 'noBorders',
                  margin: [5, 5, 5, 5],
                },
              ],
            ],
          },
          margin: [0, 10, 0, 0],
        },
        {
          table: {
            widths: ['*'],
            body: [
              [
                {
                  text: 'Ticket',
                  bold: true,
                  fontSize: 15,
                  alignment: 'left',
                },
              ],
              [
                {
                  table: {
                    widths: ['*', '*', '*'],
                    body: [
                      [
                        {
                          stack: [
                            {
                              text: 'Tipo Trabajo : ',
                              bold: true,
                              alignment: 'left',
                            },
                            {
                              text: ticket.tipotrabajo,
                              alignment: 'left',
                              opacity: 0.5,
                            },
                          ],
                          alignment: 'center',
                        },
                        {
                          stack: [
                            {
                              text: 'Descripción : ',
                              bold: true,
                              alignment: 'left',
                            },
                            {
                              text: ticket.descripcion,
                              alignment: 'left',
                              opacity: 0.5,
                            },
                          ],
                          alignment: 'center',
                        },
                        {
                          stack: [
                            {
                              text: 'Prioridad : ',
                              bold: true,
                              alignment: 'left',
                            },
                            {
                              text: ticket.prioridad === 1 ? 'Alta' : ticket.prioridad === 2 ? 'Medio' : ticket.prioridad === 3 ? 'Bajo' : '¡error-prioridad!',
                              alignment: 'left',
                              opacity: 0.5,
                            },
                          ],
                          alignment: 'center',
                        },
                      ],
                      [
                        {
                          stack: [
                            {
                              text: 'Contrata : ',
                              bold: true,
                              alignment: 'left',
                            },
                            {
                              text: ticket.contrata,
                              alignment: 'left',
                              opacity: 0.5,
                            },
                          ],
                          alignment: 'center',
                        },
                        {
                          stack: [
                            {
                              text: 'Estado : ',
                              bold: true,
                              alignment: 'left',
                            },
                            {
                              text: ticket.estado,
                              alignment: 'left',
                              opacity: 0.5,
                            },
                          ],
                          alignment: 'center',
                        },
                        {
                          stack: [
                            {
                              text: 'Fecha Creación : ',
                              bold: true,
                              alignment: 'left',
                            },
                            {
                              text: dayjs(ticket.fechacreacion).format('DD/MM/YYYY HH:mm:ss'),
                              alignment: 'left',
                              opacity: 0.5,
                            },
                          ],
                          alignment: 'center',
                        },
                      ],
                      [
                        {
                          stack: [
                            {
                              text: 'Fecha Comienzo : ',
                              bold: true,
                              alignment: 'left',
                            },
                            {
                              text: dayjs(ticket.fechacomienzo).format('DD/MM/YYYY HH:mm:ss'),
                              alignment: 'left',
                              opacity: 0.5,
                            },
                          ],
                          alignment: 'center',
                        },
                        {
                          stack: [
                            {
                              text: 'Fecha Termino : ',
                              bold: true,
                              alignment: 'left',
                            },
                            {
                              text: dayjs(ticket.fechatermino).format('DD/MM/YYYY HH:mm:ss'),
                              alignment: 'left',
                              opacity: 0.5,
                            },
                          ],
                          alignment: 'center',
                        },
                        {
                          stack: [
                            {
                              text: 'Fecha Final : ',
                              bold: true,
                              alignment: 'left',
                            },
                            {
                              text: dayjs(ticket.fechaestadofinal).format('DD/MM/YYYY HH:mm:ss'),
                              alignment: 'left',
                              opacity: 0.5,
                            },
                          ],
                          alignment: 'center',
                        },
                      ],
                      [
                        {
                          stack: [
                            {
                              text: 'Telefono : ',
                              bold: true,
                              alignment: 'left',
                            },
                            {
                              text: ticket.telefono,
                              alignment: 'left',
                              opacity: 0.5,
                            },
                          ],
                          alignment: 'center',
                        },
                        {
                          stack: [
                            {
                              text: 'Correo : ',
                              bold: true,
                              alignment: 'left',
                            },
                            {
                              text: ticket.correo,
                              alignment: 'left',
                              opacity: 0.5,
                            },
                          ],
                          alignment: 'center',
                        },
                        {
                          stack: [
                            {
                              text: 'Numero Ticket : ',
                              bold: true,
                              alignment: 'left',
                            },
                            {
                              text: ticket.rt_id,
                              alignment: 'left',
                              opacity: 0.5,
                            },
                          ],
                          alignment: 'center',
                        },
                      ],
                    ],
                  },
                  layout: 'noBorders',
                  margin: [5, 5, 5, 5],
                },
              ],
            ],
          },
          margin: [0, 10, 0, 0],
        },
        {
          text: 'Personales',
          bold: true,
          fontSize: 15,
          alignment: 'left',
          margin: [0, 10, 0, 0],
        },
        {
          table: {
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*'],
            body: personalesTableBody,
          },
          margin: [0, 10, 0, 0],
        },
        {
          text: 'Archivos Respaldo',
          bold: true,
          fontSize: 15,
          alignment: 'left',
          margin: [0, 10, 0, 0],
        },
        {
          type: 'square',
          margin: [10, 0, 0, 0],
          ul: listArchivosRespaldo,
        },
      ],
      defaultStyle: {
        // alignment: 'justify'
        font: 'Roboto',
        fontSize: 12,
      },
    };

    const pdf = new pdfmake(fonts);
    const pdfDoc = pdf.createPdfKitDocument(docDefinitionDetalles);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=DetallesTicket_${Date.now()}.pdf`);

    // Enviar el PDF directamente al cliente
    pdfDoc.pipe(res);
    pdfDoc.end();
    return;
  } else {
    return res.status(404).json({ message: "No se encontraron detalles. Asegúrese de ingresar valores válidos para 'ctrl_id' y 'rt_id'." });
  }
});
