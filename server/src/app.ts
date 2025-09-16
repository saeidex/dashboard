import configureOpenAPI from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";
import employees from "@/routes/employees/employees.index";
import expenses from "@/routes/expenses/expenses.index";
import index from "@/routes/index.route";
import orders from "@/routes/orders/orders.index";
import productCategories from "@/routes/product-categories/product-categories.index";
import vendors from "@/routes/vendors/vendors.index";

const app = createApp();

configureOpenAPI(app);

const routes = [
  index,
  orders,
  productCategories,
  employees,
  vendors,
  expenses,
] as const;

routes.forEach((route) => {
  app.route("/", route);
});

export type AppType = typeof routes[number];

export default app;
