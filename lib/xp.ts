import { prisma } from './db'

const XP_SUBMISSION = 10
const XP_GOOD_GRADE_BONUS = 20
const XP_LATE_SUBMISSION = 5

export function calculateLevel(xp: number): number {
  return Math.floor(xp / 100) + 1
}

export async function awardSubmissionXP(
  studentId: string,
  isLate: boolean
): Promise<void> {
  const xpGain = isLate ? XP_LATE_SUBMISSION : XP_SUBMISSION
  await prisma.user.update({
    where: { id: studentId },
    data: {
      xp: { increment: xpGain },
      level: {
        set: calculateLevel(
          ((await prisma.user.findUnique({ where: { id: studentId } }))?.xp ??
            0) + xpGain
        ),
      },
    },
  })
}

export async function awardGradeXP(
  studentId: string,
  grade: number
): Promise<void> {
  if (grade >= 80) {
    const user = await prisma.user.findUnique({ where: { id: studentId } })
    if (!user) return
    const newXp = user.xp + XP_GOOD_GRADE_BONUS
    await prisma.user.update({
      where: { id: studentId },
      data: {
        xp: newXp,
        level: calculateLevel(newXp),
      },
    })
  }
}
