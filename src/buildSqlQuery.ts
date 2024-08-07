import { SqlQueryOptions } from "./types";

export function buildSqlQuery(options: SqlQueryOptions): string {
  let sql = "";

  if (options.into) {
    sql += `CREATE TABLE ${options.into} as `;
  }

  sql += "SELECT";
  // Handle SELECT clause
  if (options.select) {
    sql += ` ${options.select.join(", ")}`;
  } else {
    sql += " *";
  }

  // Include aggregate statements (e.g., COUNT(*) as count) that should not get
  // quoted as the columns do for the select statement. Currently only is use in
  // chart.svelte
  if (options.aggregateSelection) {
    sql += `, ${options.aggregateSelection}`;
  }

  // Handle FROM clause
  if (options.from) {
    sql += ` FROM ${options.from}`;
  } else {
    throw new Error("FROM clause is required");
  }

  // Handle WHERE clause
  if (options.where) {
    const whereConditions = Object.entries(options.where).map(
      ([column, condition]) => {
        if (condition.operator === "LIKE") {
          // special case for fuzzy search, which will come in pre-formatted from the filter UI
          return condition.value;
        }
        return `"${column}" ${condition.operator} ${
          typeof condition.value === "string"
            ? `'${condition.value}'`
            : condition.value
        }`;
      }
    );
    sql += ` WHERE ${whereConditions.join(" AND")}`;
  }

  // Handle ORDER BY clause
  if (options.orderBy) {
    sql += ` ORDER BY ${options.orderBy}`;
  } else if (options.sort && options.sort.length > 0) {
    const sortColumns = options.sort
      .map((sortItem) => `"${sortItem.column}" ${sortItem.direction}`)
      .join(", ");
    sql += ` ORDER BY ${sortColumns}`;
  }

  // Handle LIMIT clause
  if (options.limit) {
    sql += ` LIMIT ${options.limit}`;
  }

  // Handle GROUP BY clause
  if (options.groupBy) {
    sql += ` GROUP BY ${options.groupBy.join(", ")}`;
  }

  return sql;
}
