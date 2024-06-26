import exceljs from "exceljs";
import { Request, Response, NextFunction } from "express";
import { asyncErrorHandler } from "../../utils/asynErrorHandler";
import { getFormattedDateTime } from "../../utils/getFormattedDateTime";
import { Register } from "../../models/register";

export const excelDownload = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // const data : {data: Object[], title: string} = req.body;

    // http://localhost:9001/api/v1/register/download/excel?type=acceso&ctrl_id=27&start_date=2024-01-26%2000%3A00%3A00&end_date=2024-06-30%2000%3A00%3A00&administrador=1&col_visible=ra_id&col_visible=serie&col_visible=administrador&col_visible=autorizacion&col_visible=fecha&col_visible=co_id&col_visible=ea_id&col_visible=tipo&col_visible=sn_id
    const {ctrl_id,end_date,start_date,type,col_delete,...rest} = req.query as {type: string,ctrl_id: string,start_date:string,end_date:string,col_delete: string | undefined | string[]}

    // console.log(ctrl_id,end_date,start_date,type)
    // console.log(col_delete)
    // console.log(rest)
    const registerRows = await Register.getRegistrosDownload({col_delete,ctrl_id,end_date,start_date,type,...rest})
    // return res.status(200).json("correcto");
    // console.log(`
    // Datos recividos:
    // Titulo : ${data.title}
    // Data[0] : ${JSON.stringify(data.data[0])}
    // `);

    //Create a Workbook
    const workbook = new exceljs.Workbook();
    // Set Workbook Properties
    workbook.creator = "Mercurial Systems";
    workbook.lastModifiedBy = "Mercurial Systems";
    workbook.created = new Date();
    workbook.modified = new Date();

    //Add a Worksheet
    const worksheet = workbook.addWorksheet("REGISTRO_" + type.toUpperCase());
    
    // Columns:
    worksheet.columns = registerRows.columns.map((column) => ({
      header: column.toUpperCase(),
      key: column,
      width: 20,
    }));

    // Add Rows
    registerRows.data.forEach((row) => {
      worksheet.addRow(row);
    });

    // Set font bold row 1
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });

    // const colFilter = worksheet.getColumn(Object.keys(data.data[0]).length + 3);
    // colFilter.header = "FILTROS APLICADOS";
    // colFilter.width = 20;
    // worksheet.getCell(1, Object.keys(data.data[0]).length + 3).font = {
    //   bold: true,
    // };

    // if (data.filters.length > 0) {
    //   worksheet.getCell(2, Object.keys(data.data[0]).length + 2).value =
    //     "Filtro";
    //   worksheet.getCell(2, Object.keys(data.data[0]).length + 2).font = {
    //     bold: true,
    //   };
    //   worksheet.getCell(3, Object.keys(data.data[0]).length + 2).value =
    //     "Valor";
    //   worksheet.getCell(3, Object.keys(data.data[0]).length + 2).font = {
    //     bold: true,
    //   };
    //   data.filters.forEach((filter, index) => {
    //     worksheet.getColumn(
    //       Object.keys(data.data[0]).length + 3 + index
    //     ).width = 20;
    //     worksheet.getCell(
    //       2,
    //       Object.keys(data.data[0]).length + 3 + index
    //     ).value = filter.id;
    //     worksheet.getCell(
    //       3,
    //       Object.keys(data.data[0]).length + 3 + index
    //     ).value = JSON.stringify(filter.value);
    //   });
    // } else {
    //   worksheet.getCell(2, Object.keys(data.data[0]).length + 3).value =
    //     "Filtros no aplicados";
    // }

    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=registro_${type}_${getFormattedDateTime()}.xlsx`
    );

    workbook.xlsx.write(res).then(() => {
      res.status(200);
    });
  }
);
