import moment = require("moment");

export class Parser {
    protected options = {
        parseNum: parseFloat,
        parseDate: this.parseDate,
        dateFormat: moment.ISO_8601,
        typeCast: true,
        format: "mongodb",
    };

    public sql(query) {
        let parsed = "";

        for (let p in query) {
            if (query.hasOwnProperty(p)) {
                parsed += (parsed === "") ? "" : " AND ";

                if (query[p].indexOf("*") > -1) {
                    parsed += p + " LIKE `%" + query[p].split("*").join("") + "%`";
                } else if (query[p].indexOf("...") > -1) {
                    let range = query[p].split("...");
                    parsed += p + " >= " + this.typeCast(range[0]) + " AND " + p + " <= " + this.typeCast(range[1]);
                } else if (query[p].indexOf(">") > -1) {
                    let equal = query[p].indexOf(">=") > -1;
                    let operator = equal ? ">=" : ">";
                    parsed += p + " " + operator + " " + this.typeCast(query[p].split(operator).join(""));
                } else if (query[p].indexOf("<") > -1) {
                    let equal = query[p].indexOf("<=") > -1;
                    let operator = equal ? "<=" : "<";
                    parsed += p + " " + operator + " " + this.typeCast(query[p].split(operator).join(""));
                } else if (query[p][0] === "^") {
                    parsed += p + " ILIKE `" + query[p].slice(1) + "`";
                } else {
                    parsed += p + " = `" + query[p] + "`";
                }
            }
        }

        return parsed;
    }
    public mongodb(query) {
        let parsed = {};

        for (let p in query) {
            if (query[p].indexOf("*") > -1) {
                parsed[p] = new RegExp(query[p].split("*").join(""));
            } else if (query[p].indexOf("...") > -1) {
                let range = query[p].split("...");
                parsed[p] = { $gte: this.typeCast(range[0]), $lte: this.typeCast(range[1]) };
            } else if (query[p].indexOf(">") > -1) {
                let equal = query[p].indexOf(">=") > -1;
                let operator = equal ? "$gte" : "$gt";
                parsed[p] = {};
                parsed[p][operator] = this.typeCast(query[p].split(equal ? ">=" : ">").join(""));
            } else if (query[p].indexOf("<") > -1) {
                let equal = query[p].indexOf("<=") > -1;
                let operator = equal ? "$lte" : "$lt";
                parsed[p] = {};
                parsed[p][operator] = this.typeCast(query[p].split(equal ? "<=" : "<").join(""));
            } else if (query[p] === "true" || query[p] === "false") {
                parsed[p] = query[p] === "true" ? true : false;
            } else if (query[p][0] === "^") {
                parsed[p] = new RegExp(query[p] + "$", "i");
            } else {
                parsed[p] = query[p];
            }
        }

        return parsed;
    }

    protected parseDate(date) {
        let dto = moment(date, this.options.dateFormat).format();
        return this.options.format === "sql" ? "DATE('" + dto + "')" : dto;
    }

    protected typeCast(val) {
        if (!this.options.typeCast) {
            return val;
        }

        if (val === String(this.options.parseNum(val))) {
            return this.options.parseNum(val);
        }

        if (moment(val, this.options.dateFormat, true).isValid()) {
            return this.options.parseDate(val);
        }
        return val;
    }
}
