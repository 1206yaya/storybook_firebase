import {
  Change,
  FirestoreEvent,
  QueryDocumentSnapshot,
  onDocumentUpdated,
  onDocumentCreated,
} from "firebase-functions/v2/firestore";
import { Role, Template } from "./../shared/repecheck/types";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall, onRequest } from "firebase-functions/v2/https";
import { request } from "http";
// import { doc, setDoc } from "firebase/firestore";
// Start writing functions
// https://firebase.google.com/docs/functions/typescript
initializeApp();
const db = getFirestore();

export const syncTemplateRoles = onDocumentUpdated(
  "/users/{userId}/templates/{templateId}/roles/{roleId}",
  async (
    event: FirestoreEvent<
      Change<QueryDocumentSnapshot> | undefined,
      { userId: string; templateId: string; roleId: string }
    >
  ) => {
    // 変更がない場合（undefined）は処理をスキップ
    if (!event.data) return;

    const beforeData = event.data.before.data();
    const afterData = event.data.after.data();
    const { userId, templateId, roleId } = event.params;

    // rolesMapの取得
    const templateRef = db
      .collection("users")
      .doc(userId)
      .collection("templates")
      .doc(templateId);
    const templateSnap = await templateRef.get();
    const template = templateSnap.data();
    debugger;
    console.log("template", template);
  }
);
/**
関数: syncTemplateSharingUpdates
概要
Firebase Cloud Functionsを使用して、Firestoreのドキュメント更新イベントに基づき、共有テンプレートの参照テンプレートを同期的に更新または削除します。この関数は、テンプレートの所有者または編集者によってテンプレートが更新された場合にトリガーされ、共有されている全てのユーザーの参照テンプレートに対して同じ変更を適用します。

# 動作
## 作成時
rolesMap
rolesサブコレクションがあるか？
-- yes --> 

テンプレートドキュメントが更新された際に自動的にトリガーされます。
更新によって追加された編集者に対しては、新しい参照テンプレートを作成します。
以前は編集者だったが更新によって削除されたユーザーに対しては、参照テンプレートを削除します。
これにより、共有テンプレートの参照テンプレートが常に最新の状態に保たれます。
パラメータ
change: 更新イベントに関する情報を含むオブジェクト。beforeとafterのプロパティを使用して、更新前後のドキュメントデータにアクセスします。
使用方法
この関数は、Firebase Cloud Functionsによって自動的にデプロイされ、実行されます。そのため、エンドユーザーが直接使用することはありません。以下のパスに対するドキュメント更新イベントによってトリガーされます：

bash
Copy code
/users/{userId}/templates/{templateId}
セキュリティと権限
関数は、Firestoreのセキュリティルールに従い、認証されたユーザーによって行われた更新のみを処理します。
編集者の追加または削除は、テンプレートの所有者または既存の編集者によって行われる必要があります。
注意事項
この関数は、テンプレートが共有されている場合にのみ関連する操作を行います。isSharedフラグがtrueのテンプレートに対してのみ動作します。
参照テンプレートの削除は、そのテンプレートが既に存在する場合にのみ行われます。存在しない参照テンプレートの削除操作は無視されます。

 */
// ユーティリティ関数: editorのユーザーIDを抽出
// function extractEditors(roles?: Role[]): string[] {
//   return roles
//     ? Object.entries(roles)
//         .filter(([_, role]) => role === "editor")
//         .map(([userId]) => userId)
//     : [];
// }

// export const upsertSharedTemplateReferences = onDocumentUpdated(
//   "users/{userId}/templates/{templateId}",
//   async (change: FirestoreEvent<Change<QueryDocumentSnapshot> | undefined>) => {
//     const beforeData = change.data?.before.data() as Template | undefined;
//     const afterData = change.data?.after.data() as Template | undefined;
//     const { templateId } = change.params;

//     const beforeEditors = extractEditors(beforeData?.roles);
//     const afterEditors = extractEditors(afterData?.roles);

//     const addedEditors = afterEditors.filter(
//       (userId) => !beforeEditors.includes(userId)
//     );
//     const removedEditors = beforeEditors.filter(
//       (userId) => !afterEditors.includes(userId)
//     );

//     // 参照テンプレートの更新と削除を並列で実行
//     await Promise.all([
//       ...addedEditors.map((editorUserId) =>
//         db
//           .doc(`users/${editorUserId}/templates/${templateId}`)
//           .set({ ...afterData, isRef: true }, { merge: true })
//       ),
//       ...removedEditors.map((editorUserId) =>
//         db.doc(`users/${editorUserId}/templates/${templateId}`).delete()
//       ),
//     ]);

//     console.log(
//       `Reference templates updated for added editors and deleted for removed editors.`
//     );
//   }
// );

/**
関数 syncSharedTemplateTitle は、認証されたユーザーによって呼び出され、
指定されたテンプレートIDに対してタイトルの更新を共有ユーザーに同期させるCloud Functions for FirebaseのCallable Functionです。
この関数は、クライアントアプリケーションから直接呼び出すことができ、Firebase Authenticationを用いてユーザー認証を確認します。

# 関数の目的
既存のテンプレートのタイトルを更新します。
更新は、指定された共有ユーザー（sharedWith）のテンプレートにも同期されます。
関数は認証されたユーザーからのリクエストにのみ応答します。
# パラメータ
templateId (string): タイトルを更新するテンプレートのIDです。
title (string): 新しいタイトルです。
sharedWith (string[]): タイトルの更新を同期する共有ユーザーのIDのリストです。
# レスポンス
成功時: 更新が成功したことを示すメッセージを含むオブジェクトを返します。
失敗時: エラーが発生した場合、HttpsErrorをスローします。
 */
export const syncSharedTemplateTitle = onCall(async (request) => {
  // 認証されたユーザーの存在を確認
  if (!request.auth?.uid) {
    throw new HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const { templateId, title, sharedWith } = request.data;

  if (!templateId || !title || !sharedWith) {
    throw new HttpsError(
      "invalid-argument",
      "The function must be called with the correct data parameters."
    );
  }

  // 共有テンプレートのタイトルを同期する処理
  try {
    await Promise.all(
      sharedWith.map(async (sharedUserId: string) => {
        const sharedTemplateRef = db.doc(
          `users/${sharedUserId}/templates/${templateId}`
        );
        try {
          await sharedTemplateRef.update({ title });
          console.log(
            `Updated title for shared template: ${templateId} for user: ${sharedUserId}`
          );
        } catch (error) {
          console.error(
            `Failed to update title for ${templateId} for user: ${sharedUserId}`,
            error
          );
          // 特定のユーザーでの更新失敗は致命的ではないため、ここでは例外を投げずにログに記録する
        }
      })
    );

    return {
      result: "Title update successfully synchronized with shared users.",
    };
  } catch (error) {
    // このキャッチブロックは理論上は到達しないが、念のため残す
    throw new HttpsError(
      "unknown",
      "An unexpected error occurred while updating shared template titles",
      error
    );
  }
});
