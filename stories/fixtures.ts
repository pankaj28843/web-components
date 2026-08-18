export interface PullRequestFixture {
  id: string;
  repository: string;
  number: number;
  title: string;
  role: string;
  discussion: string;
  url: string;
  patch: string;
}

const blankContextLine = ' ';

export const pullRequestFixtures = {
  react: {
    id: 'react-react-36944',
    repository: 'react/react',
    number: 36944,
    title: 'React compiler fixtures across JS and CSS',
    role: '15-file JavaScript and CSS review · 14 comments · 18 review comments',
    discussion: 'A compact excerpt from a multi-file, discussion-bearing React review.',
    url: 'https://github.com/react/react/pull/36944',
    patch: `diff --git a/packages/react-dom/src/client/ReactDOMRoot.js b/packages/react-dom/src/client/ReactDOMRoot.js
index 5a1a2aa..d7e5e11 100644
--- a/packages/react-dom/src/client/ReactDOMRoot.js
+++ b/packages/react-dom/src/client/ReactDOMRoot.js
@@ -18,7 +18,8 @@ import {has as hasInstance} from './ReactDOMComponentTree';
 const isValidContainer = container => {
   return container != null &&
     (container.nodeType === ELEMENT_NODE ||
-      container.nodeType === DOCUMENT_NODE);
+      container.nodeType === DOCUMENT_NODE ||
+      container.nodeType === DOCUMENT_FRAGMENT_NODE);
 };
${blankContextLine}
 export function createRoot(container, options) {
diff --git a/packages/react-dom/src/client/ReactDOMRoot.css b/packages/react-dom/src/client/ReactDOMRoot.css
index 27cb0f2..b1cb2ef 100644
--- a/packages/react-dom/src/client/ReactDOMRoot.css
+++ b/packages/react-dom/src/client/ReactDOMRoot.css
@@ -1,3 +1,4 @@
 .root {
   display: contents;
+  contain: content;
 }
`,
  } satisfies PullRequestFixture,
  typescript: {
    id: 'microsoft-typescript-40336',
    repository: 'microsoft/TypeScript',
    number: 40336,
    title: 'TypeScript compiler baseline update',
    role: '40 files · 208 comments · 28 review comments',
    discussion: 'A deliberately discussion-heavy compiler review with a small readable excerpt.',
    url: 'https://github.com/microsoft/TypeScript/pull/40336',
    patch: `diff --git a/src/compiler/checker.ts b/src/compiler/checker.ts
index 0b4f1a2..4f0c2d8 100644
--- a/src/compiler/checker.ts
+++ b/src/compiler/checker.ts
@@ -4221,7 +4221,10 @@ function checkExpressionWorker(node: Expression, checkMode?: CheckMode) {
     case SyntaxKind.CallExpression:
       return checkCallExpression(node, checkMode);
     case SyntaxKind.PropertyAccessExpression:
-      return checkPropertyAccessExpression(node, checkMode);
+      return checkPropertyAccessExpression(
+        node,
+        checkMode | CheckMode.SkipObjectFunctionPropertyAugment,
+      );
     default:
       return errorType;
   }
diff --git a/tests/baselines/reference/strictNullChecks.js b/tests/baselines/reference/strictNullChecks.js
index 8da9d10..ce4f7ab 100644
--- a/tests/baselines/reference/strictNullChecks.js
+++ b/tests/baselines/reference/strictNullChecks.js
@@ -6,1 +6,2 @@ declare const value: string | undefined;
 value && value.length;
+value?.length;
`,
  } satisfies PullRequestFixture,
  kubernetes: {
    id: 'kubernetes-kubernetes-137050',
    repository: 'kubernetes/kubernetes',
    number: 137050,
    title: 'Kubernetes generated API refresh',
    role: '219 files · 49 comments · 461 review comments',
    discussion: 'The large generated-file review is represented by Go plus YAML/protobuf-shaped files.',
    url: 'https://github.com/kubernetes/kubernetes/pull/137050',
    patch: `diff --git a/pkg/registry/apps/deployment/storage.go b/pkg/registry/apps/deployment/storage.go
index 9dd0f4a..b03c02e 100644
--- a/pkg/registry/apps/deployment/storage.go
+++ b/pkg/registry/apps/deployment/storage.go
@@ -71,6 +71,7 @@ func NewREST(optsGetter generic.RESTOptionsGetter) (*REST, *StatusREST, error) {
   store := &genericregistry.Store{
     NewFunc:                   func() runtime.Object { return &apps.Deployment{} },
     NewListFunc:               func() runtime.Object { return &apps.DeploymentList{} },
+    PredicateFunc:             deployment.MatchDeployment,
     EnableGarbageCollection:   true,
     ReturnDeletedObject:       true,
   }
diff --git a/api/openapi-spec/swagger.json b/api/openapi-spec/swagger.json
index 3b02a88..f9a9a0e 100644
--- a/api/openapi-spec/swagger.json
+++ b/api/openapi-spec/swagger.json
@@ -182,5 +182,6 @@
       "properties": {
         "metadata": { "$ref": "#/definitions/io.k8s.apimachinery.pkg.apis.meta.v1.ObjectMeta" },
+        "selector": { "type": "object", "additionalProperties": { "type": "string" } },
         "spec": { "$ref": "#/definitions/io.k8s.api.apps.v1.DeploymentSpec" }
       }
     }
`,
  } satisfies PullRequestFixture,
  golang: {
    id: 'golang-go-79774',
    repository: 'golang/go',
    number: 79774,
    title: 'Go testdata review proposal',
    role: 'Closed, unmerged discussion-heavy review · 57 comments',
    discussion: 'Kept because a closed/unmerged PR is a meaningful review surface, not a parser failure.',
    url: 'https://github.com/golang/go/pull/79774',
    patch: `diff --git a/src/cmd/go/testdata/script/review.txt b/src/cmd/go/testdata/script/review.txt
index 4a7f91a..7bca8d4 100644
--- a/src/cmd/go/testdata/script/review.txt
+++ b/src/cmd/go/testdata/script/review.txt
@@ -1,5 +1,8 @@
 env GO111MODULE=on
 go list ./...
+stderr 'pattern ./...'
+stdout 'reviewed'
+! go test ./missing
${blankContextLine}
 -- go.mod --
 module example.com/review
diff --git a/src/cmd/go/internal/load/pkg.go b/src/cmd/go/internal/load/pkg.go
index 42d19a1..26e4d02 100644
--- a/src/cmd/go/internal/load/pkg.go
+++ b/src/cmd/go/internal/load/pkg.go
@@ -903,4 +903,5 @@ func loadImport(path string, srcDir string, parent *Package, stk *ImportStack) {
   if p.Error != nil {
     return
   }
+  p.Internal.Imports = append(p.Internal.Imports, path)
 }
`,
  } satisfies PullRequestFixture,
  node: {
    id: 'nodejs-node-62241',
    repository: 'nodejs/node',
    number: 62241,
    title: 'Node.js runtime and documentation alignment',
    role: '11 files · 37 comments · 19 review comments',
    discussion: 'A mixed C++, header, JavaScript, and docs-shaped review excerpt.',
    url: 'https://github.com/nodejs/node/pull/62241',
    patch: `diff --git a/src/node_file.cc b/src/node_file.cc
index d08a7a3..afc1b9c 100644
--- a/src/node_file.cc
+++ b/src/node_file.cc
@@ -110,5 +110,7 @@ void ReadFile(const FunctionCallbackInfo<Value>& args) {
   Environment* env = Environment::GetCurrent(args);
   CHECK_NOT_NULL(env);
+  CHECK(args.Length() >= 1);
   Local<Context> context = env->context();
+  const int flags = UV_FS_O_FILEMAP;
   args.GetReturnValue().Set(True(context->GetIsolate()));
 }
diff --git a/doc/api/fs.md b/doc/api/fs.md
index 15d7f3c..8cb1d40 100644
--- a/doc/api/fs.md
+++ b/doc/api/fs.md
@@ -4,2 +4,4 @@ const fs = require('node:fs');
${blankContextLine}
 Reads data from a file.
+
+The callback receives the complete buffer after the descriptor is closed.
`,
  } satisfies PullRequestFixture,
  angular: {
    id: 'angular-angular-69860',
    repository: 'angular/angular',
    number: 69860,
    title: 'Angular tooling and template diagnostics',
    role: '16 files · 1 comment · 113 review comments',
    discussion: 'A review-heavy TypeScript, Bazel, HTML, and tooling-shaped input.',
    url: 'https://github.com/angular/angular/pull/69860',
    patch: `diff --git a/packages/compiler-cli/src/ngtsc/typecheck/src/context.ts b/packages/compiler-cli/src/ngtsc/typecheck/src/context.ts
index 7d7d4a2..9e20df1 100644
--- a/packages/compiler-cli/src/ngtsc/typecheck/src/context.ts
+++ b/packages/compiler-cli/src/ngtsc/typecheck/src/context.ts
@@ -29,6 +29,7 @@ export class TypeCheckContext {
   private readonly diagnostics = new Map<string, ts.Diagnostic[]>();
${blankContextLine}
   addDiagnostics(file: ts.SourceFile, diagnostics: ts.Diagnostic[]): void {
+    if (diagnostics.length === 0) return;
     this.diagnostics.set(file.fileName, diagnostics);
   }
 }
diff --git a/packages/compiler-cli/test/ngtsc/template_typecheck_spec.ts b/packages/compiler-cli/test/ngtsc/template_typecheck_spec.ts
index 7ab8419..e1e0a6b 100644
--- a/packages/compiler-cli/test/ngtsc/template_typecheck_spec.ts
+++ b/packages/compiler-cli/test/ngtsc/template_typecheck_spec.ts
@@ -51,4 +51,6 @@ describe('template type checking', () => {
   it('reports the first template diagnostic', () => {
     const diagnostics = compile('<button>{{value}}</button>');
+    expect(diagnostics[0].category).toBe(ts.DiagnosticCategory.Error);
+    expect(diagnostics[0].file).toBeDefined();
   });
 });
`,
  } satisfies PullRequestFixture,
} as const;

export type PullRequestFixtureKey = keyof typeof pullRequestFixtures;
