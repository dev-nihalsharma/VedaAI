'use client';
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Topbar } from '@/components/layout/Topbar';
import { PaperHeader } from '@/components/paper/PaperHeader';
import { StudentInfo } from '@/components/paper/StudentInfo';
import { SectionBlock } from '@/components/paper/SectionBlock';
import { ProgressOverlay } from '@/components/form/ProgressOverlay';
import { useGetAssignmentQuery, useGetPaperQuery, useRegenerateMutation } from '@/store/api';
import { useAssignmentSocket } from '@/hooks/useSocket';
import type { RootState } from '@/store';

export default function AssignmentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();

  const { data: assignment, refetch: refetchAssignment } = useGetAssignmentQuery(id, { skip: !id });
  const { data: paper, error: paperError, isFetching: paperFetching } =
    useGetPaperQuery(id, { skip: !id || assignment?.status !== 'completed' });
  const [regenerate, { isLoading: regenerating }] = useRegenerateMutation();

  useAssignmentSocket(id);
  const job = useSelector((s: RootState) => s.jobs.byAssignment[id]);
  const showOverlay =
    !!job && job.status !== 'completed' && job.status !== 'failed';

  useEffect(() => {
    if (job?.status === 'completed') {
      refetchAssignment();
    }
  }, [job?.status, refetchAssignment]);

  const notReady =
    assignment && assignment.status !== 'completed' && !paper;

  return (
    <>
      <Topbar title="Create New" onBack={() => router.push('/assignments')} />
      {assignment && (
        <div className="px-4 sm:px-8 py-4">
          <div className="no-print bg-brand text-white rounded-2xl p-4 mb-5 flex items-center justify-between">
            <p className="text-sm">
              Certainly, {assignment.title}! Here are customized Question Papers from VedaAI.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                disabled={!paper}
                className="bg-white text-ink rounded-full px-4 py-1.5 text-xs font-medium disabled:opacity-50"
              >
                Download as PDF
              </button>
              <button
                onClick={async () => {
                  await regenerate(id);
                }}
                disabled={regenerating}
                className="bg-accent text-white rounded-full px-4 py-1.5 text-xs font-medium disabled:opacity-50"
              >
                {regenerating ? 'Regenerating…' : 'Regenerate'}
              </button>
            </div>
          </div>

          <div className="paper-shell bg-white rounded-2xl shadow-soft p-6 sm:p-10 max-w-3xl mx-auto">
            {paperFetching && (
              <div className="text-center text-sm text-muted py-10">Loading paper…</div>
            )}

            {notReady && !paperFetching && (
              <div className="text-center text-sm text-muted py-10">
                {assignment.status === 'failed' ? (
                  <>
                    <p className="text-hard mb-2">Generation failed</p>
                    <p>{assignment.errorMessage}</p>
                  </>
                ) : (
                  <p>Paper is being generated… status: {assignment.status}</p>
                )}
              </div>
            )}

            {paperError && !paperFetching && (
              <div className="text-center text-sm text-hard py-10">
                Could not load paper.
              </div>
            )}

            {paper && (
              <>
                <PaperHeader meta={paper.meta} />
                <StudentInfo />
                {paper.sections.map((s) => (
                  <SectionBlock key={s.id} section={s} />
                ))}
                <div className="text-center font-semibold mt-8">End of Question Paper</div>

                {paper.answerKey && paper.answerKey.length > 0 && (
                  <div className="mt-10 page-break-before">
                    <h3 className="font-semibold">Answer Key:</h3>
                    <ol className="list-decimal list-outside pl-5 text-sm space-y-1.5 mt-2">
                      {paper.answerKey.map((a) => (
                        <li key={a.questionId}>{a.answer}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {showOverlay && <ProgressOverlay assignmentId={id} />}
    </>
  );
}
