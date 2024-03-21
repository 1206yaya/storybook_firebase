/**
# ブログの下書き
/draft

read, delete : 作成者 or モデレーター
update, create : 作成者

# 公開されたブログ
/published

read : すべてのユーザー
create: 誰もできない (Functionsの関数でのみ)
delete : 誰もできない
update : 作成者 or モデレーター

# コメント
/published/{postID}/comments/{commentID}
注意：デフォルトでは、サブコレクションは親ドキュメントのルールを継承しない

read: 匿名ユーザー以外
create: 
- ユーザーは確認済みの電子メールを持っている必要があります
- コメントは 500 文字未満である必要があり、また
- 禁止されたユーザーのリストにこれらのユーザーを含めることはできません。禁止されたユーザーのリストは、firestore のbannedUsersコレクションに保存されます。
update: 作成者 and 1時間以内
delete: 作成者 or モデレーター or 投稿の作者
 **/
import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";
import {
  RulesTestEnvironment,
  assertFails,
  
  assertSucceeds,
} from "@firebase/rules-unit-testing";
import { generateRandomString, makeTestEnv } from "../helper";
import { doc, setDoc, getDoc, updateDoc, Firestore } from "@firebase/firestore";
import * as fs from "fs";
import { FirebaseFirestore } from "@firebase/firestore-types";
import { deleteDoc } from "firebase/firestore";

async function setupTestEnvironment(rulePath: string) {
  const rule = fs.readFileSync(rulePath, "utf8");
  const testEnv: RulesTestEnvironment = await makeTestEnv(
    rule,
    "storybook-firebase-70993"
  );

  const authorDb = testEnv
    .authenticatedContext("author", { email: "alice@example.com" })
    .firestore();
  const moderatorDb = testEnv
    .authenticatedContext("moderator", {
      email: "mandy@example.com",
      isModerator: true,
    })
    .firestore();
  const anonymousDb = testEnv.unauthenticatedContext().firestore();

  const everyoneDb = testEnv
    .authenticatedContext("everyone", {
      email: "elliot@example.com",
    })
    .firestore();

  const permanentUserDb = testEnv
    .authenticatedContext("permanentUser", {
      email: "penelope@example.com",
      email_verified: true,
      // firebase: { sign_in_provider: "google.com" },
    })
    .firestore();

  return {
    testEnv,
    authorDb,
    moderatorDb,
    anonymousDb,
    everyoneDb,
    permanentUserDb,
  };
}

describe("ブログアプリ", () => {
  let testEnv: RulesTestEnvironment,
    authorDb: FirebaseFirestore,
    moderatorDb: FirebaseFirestore,
    anonymousDb: FirebaseFirestore,
    everyoneDb: FirebaseFirestore,
    permanentUserDb: FirebaseFirestore;

  beforeAll(async () => {
    ({
      testEnv,
      authorDb,
      moderatorDb,
      anonymousDb,
      everyoneDb,
      permanentUserDb,
    } = await setupTestEnvironment(__dirname + "/rules/firestore.rules"));
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  describe("ブログのドラフトテスト", () => {
    const draftId = generateRandomString();
    const newDraftPath = `drafts/${draftId}`;
    test("ドラフトの作成", async () => {
      const createRef = doc(authorDb, newDraftPath);
      await assertSucceeds(
        setDoc(createRef, {
          authorUID: "author",
          createdAt: new Date(),
          title: "My first draft",
        })
      );
    });

    test("ドラフトの更新", async () => {
      const updateRef = doc(authorDb, newDraftPath);
      await assertSucceeds(
        updateDoc(updateRef, {
          title: "アプリを作成",
          content: "アプリは素晴らしいです。一緒に作りましょう。",
        })
      );
    });

    test("匿名ユーザーによるドラフトの更新不可", async () => {
      const updateRef = doc(anonymousDb, newDraftPath);
      await assertFails(
        updateDoc(updateRef, {
          title: "アプリを作成",
          content: "アプリは素晴らしいです。一緒に作りましょう。",
        })
      );
    });

    test("作者による読み取り可能", async () => {
      const docRef = doc(authorDb, newDraftPath);
      await assertSucceeds(getDoc(docRef));
    });

    test("モデレーターによる読み取り可能", async () => {
      const docRef = doc(moderatorDb, newDraftPath);
      await assertSucceeds(getDoc(docRef));
    });

    test("匿名ユーザーによる読み取り不可", async () => {
      const docRef = doc(anonymousDb, newDraftPath);
      await assertFails(getDoc(docRef));
    });
    test("匿名ユーザーによるドラフトの削除不可", async () => {
      const deleteRef = doc(anonymousDb, newDraftPath);
      await assertFails(deleteDoc(deleteRef));
    });
    test("作者によるドラフトの削除", async () => {
      const deleteRef = doc(authorDb, newDraftPath);
      await assertSucceeds(deleteDoc(deleteRef));
    });
  });

  describe("ブログの公開テスト", () => {
    test("everyone による公開ブログの読み取り可能", async () => {
      const docRef = doc(everyoneDb, "published/new");
      await assertSucceeds(getDoc(docRef));
    });
    test("author が公開ブログを作成できない", async () => {
      const docRef = doc(authorDb, "published/new");
      await assertFails(setDoc(docRef, { title: "test", content: "test" }));
    });

    test("author が公開ブログを更新できる", async () => {
      const docRef = doc(authorDb, "published/23456");
      await assertSucceeds(
        updateDoc(docRef, { title: "test", content: "test", visible: true })
      );
    });
    test("モデレータ が公開ブログを更新できる", async () => {
      const docRef = doc(moderatorDb, "published/23456");
      await assertSucceeds(
        updateDoc(docRef, { title: "test", content: "test", visible: true })
      );
    });

    test("author が公開ブログを削除できない", async () => {
      const deleteRef = doc(authorDb, "published/23456");
      await assertFails(deleteDoc(deleteRef));
    });
    test("everyone が公開ブログを削除できない", async () => {
      const deleteRef = doc(everyoneDb, "published/23456");
      await assertFails(deleteDoc(deleteRef));
    });
  });

  describe("コメントのテスト", () => {
    const commentId = generateRandomString();
    const newCommentPath = `published/23456/comments/${commentId}`;
    test("永続ユーザのコメント作成可能", async () => {
      assertSucceeds(
        setDoc(doc(permanentUserDb, newCommentPath), {
          authorUID: "permanentUser",
          createdAt: new Date(),
          comment: "I love cupcakes.",
        })
      );
    });
    test("認証済みユーザーによるコメントの読み取り可能", async () => {
      const docRef = doc(permanentUserDb, "published/23456/comments/abcde");
      await assertSucceeds(getDoc(docRef));
    });

    test("匿名ユーザーによるコメントの読み取り不可", async () => {
      const docRef = doc(anonymousDb, "published/23456/comments/abcde");
      await assertFails(getDoc(docRef));
    });

    test("作成者によるコメントの更新可能", async () => {
      const docRef = doc(permanentUserDb, newCommentPath);
      await assertSucceeds(
        updateDoc(docRef, {
          comment: "I love cupcakes. I love them so much.",
          editedAt: new Date(),
        })
      );
    });

    test("ブログ作成者によるコメントの削除", async () => {
      const deleteRef = doc(authorDb, newCommentPath);
      await assertSucceeds(deleteDoc(deleteRef));
    });
  });
});
