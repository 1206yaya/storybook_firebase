/**
 * 
 * テンプレート一覧
 * /users/{userId}/templates/{templateId}
 */
export type Role = {
  [userId: string]: "editor" | "owner";
};
export type Item = {
  id: string;
  title: string;
};


/**
 * テンプレートを表す型定義です。
 * 
 * @export
 * @typedef Template
 * @type {object}
 * @property {string} id - ドキュメントID。
 * 参照用テンプレートの場合、オリジナルのdocumentIdと等しいです。
 * @property {string} title - テンプレートのタイトル。
 * @property {Role[]} [roles] - サブコレクション。
 * 所有者用の権限マップ。onWriteトリガー(upsertSharedTemplateReferences)で編集者側に参照用のテンプレートを作成します。
 * @property {Role} [rolesMap] - Map。
 * UI側で共有リストの表示に利用されます。
 * @property {Item[]} [items] - サブコレクション。
 * 参照用テンプレートには存在しません。itemsにアクセスする際は、rolesのownerIdを使用してアクセスします。
 */
export type Template = {
  id: string;
  title: string;
  roles?: Role[];
  rolesMap?: Role; 
  items?: Item[];
};

export type User = {
  id: string;
  name: string;
  templates: Template[];
};

export type Data = {
  users: User[];
};
