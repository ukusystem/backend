import pdfmake  from "pdfmake";
import { Request, Response, NextFunction } from "express";
import { asyncErrorHandler } from "../../../utils/asynErrorHandler";
import { TDocumentDefinitions, TableCell, UnorderedListElement } from "pdfmake/interfaces";
import { Ticket } from "../../../models/ticket";
import dayjs from 'dayjs'
import type { RequestWithUser } from "../../../types/requests";
import { join } from "node:path";
import { appConfig } from "../../../configs";

// PDF fonts:
const fonts = {
  Roboto: {
    normal: join(__dirname, "../../../../fonts/Roboto/Roboto-Regular.ttf"),
    bold: join(__dirname, "../../../../fonts/Roboto/Roboto-Bold.ttf"),
    italics: join(__dirname, "../../../../fonts/Roboto/Roboto-Italic.ttf"),
    bolditalics: join(__dirname, "../../../../fonts/Roboto/Roboto-BlackItalic.ttf"),
  },
  Courier: {
    normal: "Courier",
    bold: "Courier-Bold",
    italics: "Courier-Oblique",
    bolditalics: "Courier-BoldOblique",
  },
  Helvetica: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    italics: "Helvetica-Oblique",
    bolditalics: "Helvetica-BoldOblique",
  },
  Times: {
    normal: "Times-Roman",
    bold: "Times-Bold",
    italics: "Times-Italic",
    bolditalics: "Times-BoldItalic",
  },
  Symbol: {
    normal: "Symbol",
  },
  ZapfDingbats: {
    normal: "ZapfDingbats",
  },
};



export const downloadPdfDetalles = asyncErrorHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {

    const {ctrl_id,rt_id} = req.query as {ctrl_id:string,rt_id:string}
    const user = req.user!; // ! -> anteponer middleware auth
    const result = await Ticket.getAllTicketDetails({ctrl_id:Number(ctrl_id),rt_id:Number(rt_id), user})

    if (result) {
      const { solicitante, ticket,personales, archivos_respaldo} = result;

      const personalesRows = personales.map((personal,index)=>{
        const {nombre,telefono,dni,cargo,contrata, foto} = personal
        const fotoFinal = foto ? {
              text: "Ver",
              alignment: "left",
              link: `http://${appConfig.server.ip}:${appConfig.server.port}/api/v1/ticket/download/fotoactividadpersonal?filePath=${encodeURIComponent(foto)}`,
              color: "blue",
            }
          : "Sin Foto";

        return [index + 1,nombre,telefono,dni,cargo,contrata,fotoFinal]
      })
      const personalesTableBody : TableCell[][] = [
        [
          { text: "N°", bold: true, fontSize: 12, alignment: "left" },
          {
            text: "NOMBRE",
            bold: true,
            fontSize: 12,
            alignment: "left",
          },
          {
            text: "TELEFONO",
            bold: true,
            fontSize: 12,
            alignment: "left",
          },
          { text: "DNI", bold: true, fontSize: 12, alignment: "left" },
          {
            text: "CARGO",
            bold: true,
            fontSize: 12,
            alignment: "left",
          },
          {
            text: "CONTRATA",
            bold: true,
            fontSize: 12,
            alignment: "left",
          },
          {
            text: "FOTO",
            bold: true,
            fontSize: 12,
            alignment: "left",
          },
        ],
        ...personalesRows
      ];

      const listArchivosRespaldo: UnorderedListElement[] =
        archivos_respaldo.map((archivo) => {
          return {
            columns: [
              {
                width: "auto",
                text: archivo.nombreoriginal,
              },
              {
                width: "*",
                text: "Ver",
                alignment: "right",
                link: `http://${appConfig.server.ip}:${appConfig.server.port}/api/v1/ticket/download/archivorespaldo?filePath=${encodeURIComponent(archivo.ruta)}`,
                color: "blue",
              },
            ],
          };
        });

      const docDefinitionDetalles: TDocumentDefinitions = {
        content: [
          {
            columns: [
              {
                alignment: "left",
                columns: [
                  {
                    width: 40,
                    svg: '<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_318_552)"><path d="M60.9823 43.9359H72.7286C75.5251 54.1372 50.0746 92.1086 16.7931 64.3383L11.7589 68.8726C27.7005 87.8583 80 85.8743 80 36.5683H59.5834L56.7869 18.4328H50.0746L42.2437 42.8025L45.0405 52.1537L52.5917 33.1679L57.3463 58.6709H63.2194L60.9823 43.9359Z" fill="#549AEC"/><path d="M20.7086 36.5683H7.28406C7.28406 21.5498 31.0566 -9.62069 63.4989 15.8825L67.9737 11.3486C40.8453 -13.0211 -0.826577 3.69761 0.0124759 43.9359H19.3102L16.5134 58.1046H22.9459L27.7005 33.1679L36.9298 58.1046H42.803L30.2175 18.4328H23.5053L20.7086 36.5683Z" fill="#1668DC"/></g><defs><clipPath id="clip0_318_552"><rect width="80" height="80" fill="white"/></clipPath></defs></svg>',
                  },
                  {
                    text: "Mercurial Systems",
                    alignment: "left",
                    margin: [5, 10, 0, 0],
                    fontSize: 20,
                    bold: true,
                  },
                ],
              },
              {
                alignment: "right",
                margin: [0, 14, 0, 0],
                columns: [
                  { text: "Fecha : " },
                  { text: dayjs().format("DD/MM/YYYY HH:mm:ss"), opacity: 0.5 },
                ],
                fontSize: 12,
              },
            ],
          },
          // {
          //   table: {
          //     widths: ["40%", "60%"],
          //     body: [
          //       [
          //         {
          //           text: "Solicitante",
          //           bold: true,
          //           fontSize: 15,
          //           alignment: "left",
          //           colSpan: 2,
          //         },
          //         {},
          //       ],
          //       [
          //         {
          //           stack: [
          //             {
          //               alignment: "center",
          //               width: 100,
          //               svg: '<svg width="124" height="124" viewBox="0 0 124 124" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_510_2)"><path d="M62 124C96.2417 124 124 96.2417 124 62C124 27.7583 96.2417 0 62 0C27.7583 0 0 27.7583 0 62C0 96.2417 27.7583 124 62 124Z" fill="#111A2C"/><path fill-rule="evenodd" clip-rule="evenodd" d="M46.6346 77.434L78.5777 77.8534V103.773L46.6607 103.53L46.6346 77.434Z" fill="#F9DCA4"/><path fill-rule="evenodd" clip-rule="evenodd" d="M107.302 104.323C101.509 110.54 94.4961 115.496 86.7016 118.882C78.9071 122.267 70.4983 124.01 62.0002 124C59.4266 124 56.8554 123.841 54.3013 123.525C46.4343 122.552 38.8291 120.069 31.903 116.213C26.0059 112.932 20.6815 108.713 16.1381 103.723L18.7144 97.5028L46.6546 85.0386C46.6546 94.138 50.3466 97.3824 62.6463 97.567C77.8353 97.7938 78.5777 94.3446 78.5777 84.9664L104.241 97.569L107.302 104.323Z" fill="#D5E1ED"/><path opacity="0.11" fill-rule="evenodd" clip-rule="evenodd" d="M78.5837 77.8072V84.6373C73.0659 94.4971 50.493 94.6657 46.6346 77.434L78.5837 77.8072Z" fill="black"/><path fill-rule="evenodd" clip-rule="evenodd" d="M62.4597 16.9186C105.16 16.9186 88.5178 87.6791 62.4597 87.6791C37.8462 87.6791 19.7598 16.9186 62.4597 16.9186Z" fill="#FFE8BE"/><path fill-rule="evenodd" clip-rule="evenodd" d="M36.849 48.2458C30.6891 50.9345 35.926 63.6696 39.8025 63.6114C38.1948 58.6292 37.2029 53.469 36.849 48.2458Z" fill="#F9DCA4"/><path fill-rule="evenodd" clip-rule="evenodd" d="M88.566 48.2458C94.7259 50.9325 89.489 63.6696 85.6144 63.6114C87.2212 58.629 88.2124 53.4689 88.566 48.2458Z" fill="#F9DCA4"/><path fill-rule="evenodd" clip-rule="evenodd" d="M87.0993 59.3597C87.0993 59.3597 89.2382 41.8712 83.0562 35.7795C80.3675 42.8584 68.0036 45.2762 68.0036 45.2762C70.4043 43.5971 72.5732 41.6089 74.4544 39.3631C71.1397 40.7977 60.6579 45.0976 51.1592 41.6926C53.7433 40.135 56.1734 38.3351 58.4166 36.3173C58.4166 36.3173 49.8149 40.9763 41.482 39.8126C35.4806 44.291 38.1512 58.1959 38.1512 58.1959C30.0972 36.9533 37.5151 12.6328 62.9834 12.4923C87.7794 12.3539 95.4302 36.2631 87.0993 59.3597Z" fill="#ECBE6A"/><path fill-rule="evenodd" clip-rule="evenodd" d="M46.6607 84.6313C50.5643 90.4476 56.1281 94.9543 62.6282 97.565L52.2307 108.298L39.006 88.0242L46.6607 84.6313Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M78.5737 84.6313C74.67 90.4475 69.1062 94.9542 62.6062 97.565L73.0017 108.298L86.2284 88.0262L78.5737 84.6313Z" fill="white"/></g><defs><clipPath id="clip0_510_2"><rect width="124" height="124" fill="white"/></clipPath></defs></svg>',
          //             },
          //             {
          //               text: solicitante.nombre,
          //               alignment: "center",
          //               bold: true,
          //               fontSize: 13,
          //             },
          //             { text: solicitante.cargo, alignment: "center" },
          //           ],
          //           margin: [20, 0, 20, 0],
          //         },
          //         {
          //           table: {
          //             widths: ["50%", "50%"],
          //             heights: ["*", "*"],
          //             body: [
          //               [
          //                 {
          //                   stack: [
          //                     {
          //                       text: "Nombre : ",
          //                       bold: true,
          //                       alignment: "left",
          //                     },
          //                     {
          //                       text: solicitante.nombre,
          //                       alignment: "left",
          //                       opacity: 0.5,
          //                     },
          //                   ],
          //                   alignment: "center",
          //                 },
          //                 {
          //                   stack: [
          //                     {
          //                       text: "Telefono : ",
          //                       bold: true,
          //                       alignment: "left",
          //                     },
          //                     {
          //                       text: solicitante.telefono,
          //                       alignment: "left",
          //                       opacity: 0.5,
          //                     },
          //                   ],
          //                   alignment: "center",
          //                 },
          //               ],
          //               [
          //                 {
          //                   stack: [
          //                     {
          //                       text: "Correo : ",
          //                       bold: true,
          //                       alignment: "left",
          //                     },
          //                     {
          //                       text: solicitante.correo,
          //                       alignment: "left",
          //                       opacity: 0.5,
          //                     },
          //                   ],
          //                   alignment: "center",
          //                 },
          //                 {
          //                   stack: [
          //                     {
          //                       text: "Telefono : ",
          //                       bold: true,
          //                       alignment: "left",
          //                     },
          //                     {
          //                       text: solicitante.telefono,
          //                       alignment: "left",
          //                       opacity: 0.5,
          //                     },
          //                   ],
          //                   alignment: "center",
          //                 },
          //               ],
          //               [
          //                 {
          //                   stack: [
          //                     {
          //                       text: "Cargo : ",
          //                       bold: true,
          //                       alignment: "left",
          //                     },
          //                     {
          //                       text: solicitante.cargo,
          //                       alignment: "left",
          //                       opacity: 0.5,
          //                     },
          //                   ],
          //                   alignment: "center",
          //                 },
          //                 {
          //                   stack: [
          //                     {
          //                       text: "Contrata : ",
          //                       bold: true,
          //                       alignment: "left",
          //                     },
          //                     {
          //                       text: solicitante.contrata,
          //                       alignment: "left",
          //                       opacity: 0.5,
          //                     },
          //                   ],
          //                   alignment: "center",
          //                 },
          //               ],
          //             ],
          //           },
          //           layout: "noBorders",
          //           margin: [5, 5, 5, 5],
          //           alignment: "center",
          //         },
          //       ],
          //     ],
          //   },
          //   margin: [0, 10, 0, 0],
          // },
          {
            table: {
              widths: ["*"],
              body: [
                [
                  {
                    text: "Solicitante",
                    bold: true,
                    fontSize: 15,
                    alignment: "left",
                  },
                ],
                [
                  {
                    table: {
                      widths: ["*", "*"],
                      body: [
                        [
                          {
                            stack: [
                              {
                                text: "Nombre : ",
                                bold: true,
                                alignment: "left",
                              },
                              {
                                text: solicitante.nombre,
                                alignment: "left",
                                opacity: 0.5,
                              },
                            ],
                            alignment: "center",
                          },
                          {
                            stack: [
                              {
                                text: "Telefono : ",
                                bold: true,
                                alignment: "left",
                              },
                              {
                                text: solicitante.telefono,
                                alignment: "left",
                                opacity: 0.5,
                              },
                            ],
                            alignment: "center",
                          },
                        ],
                        [
                          {
                            stack: [
                              {
                                text: "Correo : ",
                                bold: true,
                                alignment: "left",
                              },
                              {
                                text: solicitante.correo,
                                alignment: "left",
                                opacity: 0.5,
                              },
                            ],
                            alignment: "center",
                          },
                          {
                            stack: [
                              {
                                text: "DNI : ",
                                bold: true,
                                alignment: "left",
                              },
                              {
                                text: solicitante.dni,
                                alignment: "left",
                                opacity: 0.5,
                              },
                            ],
                            alignment: "center",
                          },
                        ],
                        [
                          {
                            stack: [
                              {
                                text: "Cargo : ",
                                bold: true,
                                alignment: "left",
                              },
                              {
                                text: solicitante.cargo,
                                alignment: "left",
                                opacity: 0.5,
                              },
                            ],
                            alignment: "center",
                          },
                          {
                            stack: [
                              {
                                text: "Contrata : ",
                                bold: true,
                                alignment: "left",
                              },
                              {
                                text: solicitante.contrata,
                                alignment: "left",
                                opacity: 0.5,
                              },
                            ],
                            alignment: "center",
                          },
                        ],
                      ],
                    },
                    layout: "noBorders",
                    margin: [5, 5, 5, 5],
                  },
                ],
              ],
            },
            margin: [0, 10, 0, 0],
          },
          {
            table: {
              widths: ["*"],
              body: [
                [
                  {
                    text: "Ticket",
                    bold: true,
                    fontSize: 15,
                    alignment: "left",
                  },
                ],
                [
                  {
                    table: {
                      widths: ["*", "*", "*"],
                      body: [
                        [
                          {
                            stack: [
                              {
                                text: "Tipo Trabajo : ",
                                bold: true,
                                alignment: "left",
                              },
                              {
                                text: ticket.tipotrabajo,
                                alignment: "left",
                                opacity: 0.5,
                              },
                            ],
                            alignment: "center",
                          },
                          {
                            stack: [
                              {
                                text: "Descripción : ",
                                bold: true,
                                alignment: "left",
                              },
                              {
                                text: ticket.descripcion,
                                alignment: "left",
                                opacity: 0.5,
                              },
                            ],
                            alignment: "center",
                          },
                          {
                            stack: [
                              {
                                text: "Prioridad : ",
                                bold: true,
                                alignment: "left",
                              },
                              {
                                text:
                                  ticket.prioridad == 1
                                    ? "Alta"
                                    : ticket.prioridad == 2
                                    ? "Medio"
                                    : ticket.prioridad == 3
                                    ? "Bajo"
                                    : "¡eror-prioridad!",
                                alignment: "left",
                                opacity: 0.5,
                              },
                            ],
                            alignment: "center",
                          },
                        ],
                        [
                          {
                            stack: [
                              {
                                text: "Contrata : ",
                                bold: true,
                                alignment: "left",
                              },
                              {
                                text: ticket.contrata,
                                alignment: "left",
                                opacity: 0.5,
                              },
                            ],
                            alignment: "center",
                          },
                          {
                            stack: [
                              {
                                text: "Estado : ",
                                bold: true,
                                alignment: "left",
                              },
                              {
                                text: ticket.estado,
                                alignment: "left",
                                opacity: 0.5,
                              },
                            ],
                            alignment: "center",
                          },
                          {
                            stack: [
                              {
                                text: "Fecha Creación : ",
                                bold: true,
                                alignment: "left",
                              },
                              {
                                text: dayjs(ticket.fechacreacion).format(
                                  "DD/MM/YYYY HH:mm:ss"
                                ),
                                alignment: "left",
                                opacity: 0.5,
                              },
                            ],
                            alignment: "center",
                          },
                        ],
                        [
                          {
                            stack: [
                              {
                                text: "Fecha Comienzo : ",
                                bold: true,
                                alignment: "left",
                              },
                              {
                                text: dayjs(ticket.fechacomienzo).format(
                                  "DD/MM/YYYY HH:mm:ss"
                                ),
                                alignment: "left",
                                opacity: 0.5,
                              },
                            ],
                            alignment: "center",
                          },
                          {
                            stack: [
                              {
                                text: "Fecha Termino : ",
                                bold: true,
                                alignment: "left",
                              },
                              {
                                text: dayjs(ticket.fechatermino).format(
                                  "DD/MM/YYYY HH:mm:ss"
                                ),
                                alignment: "left",
                                opacity: 0.5,
                              },
                            ],
                            alignment: "center",
                          },
                          {
                            stack: [
                              {
                                text: "Fecha Final : ",
                                bold: true,
                                alignment: "left",
                              },
                              {
                                text: dayjs(ticket.fechaestadofinal).format(
                                  "DD/MM/YYYY HH:mm:ss"
                                ),
                                alignment: "left",
                                opacity: 0.5,
                              },
                            ],
                            alignment: "center",
                          },
                        ],
                        [
                          {
                            stack: [
                              {
                                text: "Telefono : ",
                                bold: true,
                                alignment: "left",
                              },
                              {
                                text: ticket.telefono,
                                alignment: "left",
                                opacity: 0.5,
                              },
                            ],
                            alignment: "center",
                          },
                          {
                            stack: [
                              {
                                text: "Correo : ",
                                bold: true,
                                alignment: "left",
                              },
                              {
                                text: ticket.correo,
                                alignment: "left",
                                opacity: 0.5,
                              },
                            ],
                            alignment: "center",
                          },
                          {
                            stack: [
                              {
                                text: "Numero Ticket : ",
                                bold: true,
                                alignment: "left",
                              },
                              {
                                text: ticket.rt_id,
                                alignment: "left",
                                opacity: 0.5,
                              },
                            ],
                            alignment: "center",
                          },
                        ],
                      ],
                    },
                    layout: "noBorders",
                    margin: [5, 5, 5, 5],
                  },
                ],
              ],
            },
            margin: [0, 10, 0, 0],
          },
          {
            text: "Personales",
            bold: true,
            fontSize: 15,
            alignment: "left",
            margin: [0, 10, 0, 0],
          },
          {
            table: {
              widths: ["auto", "auto", "auto", "auto", "auto", "auto","*"],
              body: personalesTableBody,
            },
            margin: [0, 10, 0, 0],
          },
          {
            text: "Archivos Respaldo",
            bold: true,
            fontSize: 15,
            alignment: "left",
            margin: [0, 10, 0, 0],
          },
          {
            type: "square",
            margin: [10, 0, 0, 0],
            ul: listArchivosRespaldo,

          },
        ],
        defaultStyle: {
          // alignment: 'justify'
          font: "Roboto",
          fontSize:12
        },
      };

      const pdf = new pdfmake(fonts);
      const pdfDoc = pdf.createPdfKitDocument(docDefinitionDetalles);
      res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=DetallesTicket_${Date.now()}.pdf`
      );

      // Enviar el PDF directamente al cliente
      pdfDoc.pipe(res);
      pdfDoc.end();
      return
    }else{
        return res.status(404).json({message:"No se encontraron detalles. Asegúrese de ingresar valores válidos para 'ctrl_id' y 'rt_id'."})
    }

  }
);
