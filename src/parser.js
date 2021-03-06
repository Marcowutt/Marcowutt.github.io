import fs from "fs"
import ohm from "ohm-js"
import * as ast from "./ast.js"

const pandaGrammar = ohm.grammar(fs.readFileSync("src/panda.ohm"))

const astBuilder = carlosGrammar.createSemantics().addOperation("ast", {
  Program(body) {
    return new ast.Program(body.ast())
  },
  Statement_vardecl(kind, id, _eq, initializer, _semi) {
    const [name, readOnly] = [id.sourceString, kind.sourceString == "const"]
    return new ast.VariableDeclaration(name, readOnly, initializer.ast())
  },
  StructDecl(_struct, id, _left, fields, _right) {
    return new ast.StructDeclaration(id.sourceString, fields.ast())
  },
  Field(id, _colon, type) {
    return new ast.Field(id.sourceString, type.ast())
  },
  FunDecl(_fun, id, parameters, _colons, returnType, body) {
    const returnTypeTree = returnType.ast()
    return new ast.FunctionDeclaration(
      id.sourceString,
      parameters.ast(),
      returnTypeTree.length === 0 ? null : returnTypeTree[0],
      body.ast()
    )
  },
  Params(_left, bindings, _right) {
    return bindings.asIteration().ast()
  },
  Param(id, _colon, type) {
    return new ast.Parameter(id.sourceString, type.ast())
  },
  TypeExp_array(_left, baseType, _right) {
    return new ast.ArrayType(baseType.ast())
  },
  TypeExp_function(_left, inTypes, _right, _arrow, outType) {
    return new ast.FunctionType(inTypes.asIteration().ast(), outType.ast())
  },
  TypeExp_optional(baseType, _questionMark) {
    return new ast.OptionalType(baseType.ast())
  },
  TypeExp_id(id) {
    return new ast.TypeId(id.sourceString)
  },
  Statement_bump(variable, operator, _semi) {
    return operator.sourceString === "++"
      ? new ast.Increment(variable.ast())
      : new ast.Decrement(variable.ast())
  },
  Statement_assign(variable, _eq, expression, _semi) {
    return new ast.Assignment(variable.ast(), expression.ast())
  },
  Statement_call(call, _semi) {
    return call.ast()
  },
  Statement_break(_break, _semi) {
    return new ast.BreakStatement()
  },
  Statement_return(_return, expression, _semi) {
    const returnValueTree = expression.ast()
    if (returnValueTree.length === 0) {
      return new ast.ShortReturnStatement()
    }
    return new ast.ReturnStatement(returnValueTree[0])
  },
  IfStmt_long(_if, test, consequent, _else, alternate) {
    return new ast.IfStatement(test.ast(), consequent.ast(), alternate.ast())
  },
  IfStmt_short(_if, test, consequent) {
    return new ast.ShortIfStatement(test.ast(), consequent.ast())
  },
  LoopStmt_while(_while, test, body) {
    return new ast.WhileStatement(test.ast(), body.ast())
  },
  LoopStmt_repeat(_repeat, count, body) {
    return new ast.RepeatStatement(count.ast(), body.ast())
  },
  LoopStmt_range(_for, id, _in, low, op, high, body) {
    return new ast.ForRangeStatement(
      id.sourceString,
      low.ast(),
      op.sourceString,
      high.ast(),
      body.ast()
    )
  },
  LoopStmt_collection(_for, id, _in, collection, body) {
    return new ast.ForStatement(id.sourceString, collection.ast(), body.ast())
  },
  Block(_open, body, _close) {
    // No need for a block node, just return the list of statements
    return body.ast()
  },
  Exp_conditional(test, _questionMark, consequent, _colon, alternate) {
    return new ast.Conditional(test.ast(), consequent.ast(), alternate.ast())
  },
  Exp1_unwrapelse(unwrap, _op, alternate) {
    return new ast.UnwrapElse(unwrap.ast(), alternate.ast())
  },
  Exp2_or(first, _ors, rest) {
    return new ast.OrExpression([first.ast(), ...rest.ast()])
  },
  Exp2_and(first, _ors, rest) {
    return new ast.AndExpression([first.ast(), ...rest.ast()])
  },
  Exp3_bitor(left, ops, right) {
    const [op, operands] = [ops.sourceString[0], [left.ast(), ...right.ast()]]
    return operands.reduce((x, y) => new ast.BinaryExpression(op, x, y))
  },
  Exp3_bitxor(left, ops, right) {
    const [op, operands] = [ops.sourceString[0], [left.ast(), ...right.ast()]]
    return operands.reduce((x, y) => new ast.BinaryExpression(op, x, y))
  },
  Exp3_bitand(left, ops, right) {
    const [op, operands] = [ops.sourceString[0], [left.ast(), ...right.ast()]]
    return operands.reduce((x, y) => new ast.BinaryExpression(op, x, y))
  },
  Exp4_compare(left, op, right) {
    return new ast.BinaryExpression(op.sourceString, left.ast(), right.ast())
  },
  Exp5_shift(left, op, right) {
    return new ast.BinaryExpression(op.sourceString, left.ast(), right.ast())
  },
  Exp6_add(left, op, right) {
    return new ast.BinaryExpression(op.sourceString, left.ast(), right.ast())
  },
  Exp7_multiply(left, op, right) {
    return new ast.BinaryExpression(op.sourceString, left.ast(), right.ast())
  },
  Exp8_power(left, op, right) {
    return new ast.BinaryExpression(op.sourceString, left.ast(), right.ast())
  },
  Exp8_unary(op, operand) {
    return new ast.UnaryExpression(op.sourceString, operand.ast())
  },
  Exp9_emptyarray(_keyword, _left, _of, type, _right) {
    return new ast.EmptyArray(type.ast())
  },
  Exp9_arrayexp(_left, args, _right) {
    return new ast.ArrayExpression(args.asIteration().ast())
  },
  Exp9_emptyopt(_no, type) {
    return new ast.EmptyOptional(type.ast())
  },
  Exp9_parens(_open, expression, _close) {
    return expression.ast()
  },
  Var_subscript(array, _left, subscript, _right) {
    return new ast.SubscriptExpression(array.ast(), subscript.ast())
  },
  Var_member(object, _dot, field) {
    return new ast.MemberExpression(object.ast(), field.sourceString)
  },
  Var_id(id) {
    return new ast.IdentifierExpression(id.sourceString)
  },
  Var_call(callee, _left, args, _right) {
    return new ast.Call(callee.ast(), args.asIteration().ast())
  },
  true(_) {
    return true
  },
  false(_) {
    return false
  },
  intlit(_digits) {
    return BigInt(this.sourceString)
  },
  floatlit(_whole, _point, _fraction, _e, _sign, _exponent) {
    return Number(this.sourceString)
  },
  stringlit(_open, chars, _close) {
    return chars.sourceString
  },
})

export default function parse(sourceCode) {
  const match = carlosGrammar.match(sourceCode)
  if (!match.succeeded()) {
    throw new Error(match.message)
  }
  return astBuilder(match).ast()
}
