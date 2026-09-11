const { AccountTransaction, AccountCategory, Admin } = require("../models");
const { Op } = require("sequelize");
const path = require("path");

exports.getLedger = async (req, res) => {
  try {
    const { start_date, end_date, type, category_id } = req.query;

    let whereClause = {};

    if (start_date && end_date) {
      whereClause.transaction_date = { [Op.between]: [start_date, end_date] };
    } else if (start_date) {
      whereClause.transaction_date = { [Op.gte]: start_date };
    } else if (end_date) {
      whereClause.transaction_date = { [Op.lte]: end_date };
    }

    if (type) whereClause.transaction_type = type;
    if (category_id) whereClause.category_id = category_id;

    const transactions = await AccountTransaction.findAll({
      where: whereClause,
      include: [AccountCategory, Admin],
      order: [
        ["transaction_date", "DESC"],
        ["id", "DESC"],
      ],
    });

    const categories = await AccountCategory.findAll();

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((t) => {
      if (t.transaction_type === "INCOME") totalIncome += parseFloat(t.amount);
      if (t.transaction_type === "EXPENSE")
        totalExpense += parseFloat(t.amount);
    });

    res.render("accounts/ledger", {
      transactions,
      categories,
      totalIncome,
      totalExpense,
      currentBalance: totalIncome - totalExpense,
      filters: req.query,
      adminName: req.session.adminName,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading ledger");
  }
};

exports.addCategory = async (req, res) => {
  try {
    const { name, type } = req.body;
    await AccountCategory.create({ name, type });
    res.redirect("/admin/accounts");
  } catch (error) {
    res.status(500).send("Error adding category");
  }
};

exports.addTransaction = async (req, res) => {
  try {
    const {
      transaction_type,
      category_id,
      amount,
      transaction_date,
      payment_method,
      reference,
      description,
    } = req.body;

    const transactionData = {
      transaction_type,
      category_id,
      amount,
      transaction_date,
      payment_method,
      reference,
      description,
      created_by: req.session.adminId,
    };

    if (req.file) {
      transactionData.receipt_file_name = req.file.originalname;
      transactionData.receipt_file_path = req.file.filename;
    }

    await AccountTransaction.create(transactionData);
    res.redirect("/admin/accounts");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error recording transaction");
  }
};

exports.viewReceipt = async (req, res) => {
  try {
    const txn = await AccountTransaction.findByPk(req.params.id);
    if (!txn || !txn.receipt_file_path) {
      return res.status(404).send("Receipt not found");
    }

    const safePath = path.resolve(
      __dirname,
      "../../storage/documents",
      txn.receipt_file_path,
    );
    res.sendFile(safePath);
  } catch (error) {
    res.status(500).send("Error accessing receipt document");
  }
};
