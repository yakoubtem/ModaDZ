// @ts-nocheck
import * as __fd_glob_21 from "../content/docs/user-roles.mdx?collection=docs"
import * as __fd_glob_20 from "../content/docs/user-management.mdx?collection=docs"
import * as __fd_glob_19 from "../content/docs/troubleshooting.mdx?collection=docs"
import * as __fd_glob_18 from "../content/docs/settings.mdx?collection=docs"
import * as __fd_glob_17 from "../content/docs/sales.mdx?collection=docs"
import * as __fd_glob_16 from "../content/docs/reports-exports.mdx?collection=docs"
import * as __fd_glob_15 from "../content/docs/products.mdx?collection=docs"
import * as __fd_glob_14 from "../content/docs/pos.mdx?collection=docs"
import * as __fd_glob_13 from "../content/docs/inventory.mdx?collection=docs"
import * as __fd_glob_12 from "../content/docs/installation.mdx?collection=docs"
import * as __fd_glob_11 from "../content/docs/index.mdx?collection=docs"
import * as __fd_glob_10 from "../content/docs/getting-started.mdx?collection=docs"
import * as __fd_glob_9 from "../content/docs/faq.mdx?collection=docs"
import * as __fd_glob_8 from "../content/docs/expenses.mdx?collection=docs"
import * as __fd_glob_7 from "../content/docs/debt-management.mdx?collection=docs"
import * as __fd_glob_6 from "../content/docs/dashboard.mdx?collection=docs"
import * as __fd_glob_5 from "../content/docs/customers.mdx?collection=docs"
import * as __fd_glob_4 from "../content/docs/changelog.mdx?collection=docs"
import * as __fd_glob_3 from "../content/docs/backup-restore.mdx?collection=docs"
import * as __fd_glob_2 from "../content/docs/authentication.mdx?collection=docs"
import * as __fd_glob_1 from "../content/docs/architecture.mdx?collection=docs"
import { default as __fd_glob_0 } from "../content/docs/meta.json?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.docs("docs", "content/docs", {"meta.json": __fd_glob_0, }, {"architecture.mdx": __fd_glob_1, "authentication.mdx": __fd_glob_2, "backup-restore.mdx": __fd_glob_3, "changelog.mdx": __fd_glob_4, "customers.mdx": __fd_glob_5, "dashboard.mdx": __fd_glob_6, "debt-management.mdx": __fd_glob_7, "expenses.mdx": __fd_glob_8, "faq.mdx": __fd_glob_9, "getting-started.mdx": __fd_glob_10, "index.mdx": __fd_glob_11, "installation.mdx": __fd_glob_12, "inventory.mdx": __fd_glob_13, "pos.mdx": __fd_glob_14, "products.mdx": __fd_glob_15, "reports-exports.mdx": __fd_glob_16, "sales.mdx": __fd_glob_17, "settings.mdx": __fd_glob_18, "troubleshooting.mdx": __fd_glob_19, "user-management.mdx": __fd_glob_20, "user-roles.mdx": __fd_glob_21, });