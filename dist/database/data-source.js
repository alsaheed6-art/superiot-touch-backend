"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const typeorm_1 = require("typeorm");
const database_options_1 = require("./database.options");
exports.default = new typeorm_1.DataSource((0, database_options_1.databaseOptions)());
//# sourceMappingURL=data-source.js.map