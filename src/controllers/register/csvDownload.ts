import exceljs from "exceljs";
import { Request, Response, NextFunction } from "express";
import { asyncErrorHandler } from "../../utils/asynErrorHandler";
import { getFormattedDateTime } from "../../utils/getFormattedDateTime";

export const csvDownload = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const data : {data: Object[], title: string} = req.body;
    //Create a Workbook
    const workbook = new exceljs.Workbook();
    // Set Workbook Properties
    // workbook.creator = "Mercurial Systems";
    // workbook.lastModifiedBy = "Mercurial Systems";
    // workbook.created = new Date();
    // workbook.modified = new Date();

    //Add a Worksheet
    const worksheet = workbook.addWorksheet(data.title);

    // Columns:
    worksheet.columns = Object.keys(data.data[0]).map((keydata) => ({
      header: keydata.toUpperCase(),
      key: keydata,
      width: 20,
    }));

    // Add Rows
    data.data.forEach((row) => {
      worksheet.addRow(row);
    });

    // Set font bold row 1
    // worksheet.getRow(1).eachCell((cell) => {
    //   cell.font = { bold: true };
    // });

    // const colFilter = worksheet.getColumn(Object.keys(data.data[0]).length + 3);
    // colFilter.header = "FILTROS APLICADOS";
    // colFilter.width= 20;
    // worksheet.getCell(1, Object.keys(data.data[0]).length + 3).font = {bold:true}

    // if (data.filters.length > 0) {
    //   worksheet.getCell(2 ,Object.keys(data.data[0]).length + 2 ).value = "Filtro";
    //   worksheet.getCell(2 ,Object.keys(data.data[0]).length + 2 ).font = {bold:true}
    //   worksheet.getCell(3 ,Object.keys(data.data[0]).length + 2 ).value = "Valor";
    //   worksheet.getCell(3 ,Object.keys(data.data[0]).length + 2 ).font = {bold:true}
    //   data.filters.forEach((filter, index) => {
    //    worksheet.getColumn(Object.keys(data.data[0]).length + 3 + index).width = 20
    //     worksheet.getCell(2 ,Object.keys(data.data[0]).length + 3 + index).value = filter.id;
    //     worksheet.getCell(3,Object.keys(data.data[0]).length + 3 + index).value = JSON.stringify(filter.value);
    //   });
    // } else {
    //   worksheet.getCell(2, Object.keys(data.data[0]).length + 3).value =
    //     "Filtros no aplicados";
    // }

    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");

    res.setHeader("Content-Type", "text/csv");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=registro_${data.title.replace(
        / /g,
        "-"
      )}_${getFormattedDateTime()}.csv`
    );

    workbook.csv.write(res).then(() => {
      res.status(200);
    });
  }
);
