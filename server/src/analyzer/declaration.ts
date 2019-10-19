/*
* declaration.ts
* Copyright (c) Microsoft Corporation.
* Licensed under the MIT license.
* Author: Eric Traut
*
* Tracks the location within the code where a named entity
* is declared and its associated declared type (if the type
* is explicitly declared).
*/

import { DiagnosticTextRange } from '../common/diagnostic';
import { ClassNode, ExpressionNode, FunctionNode, NameNode,
    ParameterNode, ParseNode, StringListNode } from '../parser/parseNodes';
import { Type } from './types';

export const enum DeclarationType {
    BuiltIn,
    Variable,
    Parameter,
    Function,
    Method,
    Class,
    Alias
}

export interface DeclarationBase {
    // Category of this symbol (function, variable, etc.).
    // Used by hover provider to display helpful text.
    type: DeclarationType;

    // Many declarations have a parse node associated with them.
    node?: ParseNode;

    // The file and range within that file that
    // contains the declaration.
    path: string;
    range: DiagnosticTextRange;
}

export interface BuiltInDeclaration extends DeclarationBase {
    type: DeclarationType.BuiltIn;
    declaredType: Type;
}

export interface ClassDeclaration extends DeclarationBase {
    type: DeclarationType.Class;
    node: ClassNode;
}

export interface FunctionDeclaration extends DeclarationBase {
    type: DeclarationType.Function | DeclarationType.Method;
    node: FunctionNode;
}

export interface ParameterDeclaration extends DeclarationBase {
    type: DeclarationType.Parameter;
    node: ParameterNode;
}

export interface VariableDeclaration extends DeclarationBase {
    type: DeclarationType.Variable;
    node: NameNode | StringListNode;

    typeAnnotationNode?: ExpressionNode;

    // Is the declaration considered "constant" (i.e.
    // reassignment is not permitted)?
    isConstant?: boolean;
}

// Alias declarations are used for imports. They are resolved
// after the binding phase.
export interface AliasDeclaration extends DeclarationBase, ModuleLoaderActions {
    type: DeclarationType.Alias;

    // If a symbolName is defined, the alias refers to a symbol
    // within a resolved module (whose path is defined in the
    // 'path' field). If symbolName is missing, the alias refers
    // to the module itself.
    symbolName?: string;
}

// This interface represents a set of actions that the python loader
// performs when a module import is encountered.
export interface ModuleLoaderActions {
    // The resolved path of the implicit import. This can be empty
    // if the resolved path doesn't reference a module (e.g. it's
    // a directory).
    path: string;

    // If the alias is targeting a module, multiple other modules
    // may also need to be resolved and inserted implicitly into
    // the module's namespace to emulate the behavior of the python
    // module loader. This can be recursive (e.g. in the case of
    // an "import a.b.c.d" statement).
    implicitImports: Map<string, ModuleLoaderActions>;
}

export type Declaration = BuiltInDeclaration | ClassDeclaration |
    FunctionDeclaration | ParameterDeclaration | VariableDeclaration |
    AliasDeclaration;
