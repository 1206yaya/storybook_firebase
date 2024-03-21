// export const data: any = {
//   users: [
//     {
//       id: "userA",
//       name: "User A",
//       // subCollection
//       templates: [
//         {
//           id: "tempA1",
//           title: "Template A1",
//           isShared: true,
//           roles: {
//             userA: "owner",
//             userB: "editor",
//           },
//           items: [
//             {
//               id: "itemA1-1",
//               title: "Item A1-1",
//             },
//           ],
//         },
//         {
//           id: "tempA2",
//           title: "Template A2",
//           items: [
//             {
//               id: "itemA2-1",
//               title: "Item A2-1",
//             },
//           ],
//         },
//       ],
//     },
//     {
//       id: "userB",
//       name: "User B",
//       // subCollection
//       templates: [
//         {
//           id: "tempB1",
//           title: "Template B1",
//         },
//         {
//           id: "tempB2",
//           title: "Template B2",
//         },
//         // Functionsを使ってスニペットを生成する
//         // テンプレートの詳細情報のパス
//         // /users/ownerId/templates/templateId
//         {
//           id: "tempA1",
//           title: "Template A1",
//           isRef: true,
//           roles: {
//             userA: "owner",
//             userB: "editor",
//           },
//         },
//       ],
//     },
//   ],
// };
import {
  Data,
  User,
  Template,
  Roles,
  Item,
} from "../../functions/src/shared/repecheck/types";
// 実際のデータに対する型の適用
export const data: Data = {
  users: [
    {
      id: "userA",
      name: "User A",
      templates: [
        {
          id: "templateA1",
          title: "Template A1",
          isShared: true,
          roles: {
            userA: "owner",
            userB: "editor",
          },
          items: [
            {
              id: "itemA1-1",
              title: "Item A1-1",
            },
          ],
        },
        {
          id: "templateA2",
          title: "Template A2",
          items: [
            {
              id: "itemA2-1",
              title: "Item A2-1",
            },
          ],
        },
      ],
    },
    {
      id: "userB",
      name: "User B",
      templates: [
        {
          id: "templateB1",
          title: "Template B1",
          items: [
            {
              id: "itemB1-1",
              title: "Item B1-1",
            },
          ],
        },
        {
          id: "templateB2",
          title: "Template B2",
          items: [
            {
              id: "itemB2-1",
              title: "Item B2-1",
            },
          ],
        },
        {
          id: "templateA1",
          title: "Template A1",
          isShared: true,
          isRef: true,
          roles: {
            userA: "owner",
            userB: "editor",
          },
        },
      ],
    },
  ],
};
