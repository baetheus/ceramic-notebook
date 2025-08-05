import type * as S from "~/db/schema.ts"
import type { DataAccess } from "~/db/types.ts"

import * as R from "pick/router";

function createElementsRouter<A>({ elements }: DataAccess<A>) {

  function create(element: Omit<S.Element, "created_at" | "updated_at"">) {



}
