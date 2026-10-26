import { Container } from '@/components/site/layout'
import { FilesPanel } from '../FilesPanel'
import { ReviewsPanel } from '../ReviewsPanel'
import { TrustPanel } from '../TrustPanel'
import { PackActions, MobileDownloadBar } from './PackActions'
import { PackHeader, Breadcrumb, StatusNotice } from './PackHeader'
import { PackNotes, Adaptations } from './PackNotes'
import { Preview } from './Preview'
import { ReportDialog } from './ReportDialog'
import type { PackPageModel } from './usePackPage'

export function PackPageView({ model }: { model: PackPageModel }) {
  const { resource, downloads, endRef } = model
  return (
    <>
      <Container className="pt-6 pb-32 lg:pb-0">
        <Breadcrumb resource={resource} />
        {resource.status !== 'published' && <StatusNotice resource={resource} />}
        <div className="mt-5 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-x-12">
          <div className="min-w-0 lg:col-start-1 lg:row-start-1">
            <PackHeader resource={resource} />
          </div>
          {/* Phones retain the title, trust, preview order. */}
          <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <div className="lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto lg:overscroll-contain">
              <TrustPanel resource={resource} actions={<PackActions model={model} />} />
            </div>
          </div>
          <div className="min-w-0 space-y-12 lg:col-start-1 lg:row-start-2">
            <Preview resource={resource} downloads={downloads} />
            <FilesPanel resource={resource} downloads={downloads} />
            <PackNotes resource={resource} />
            <Adaptations model={model} />
            <ReviewsPanel resource={resource} />
          </div>
        </div>
        <div ref={endRef} aria-hidden="true" className="h-px" />
      </Container>
      {downloads.canDownload && <MobileDownloadBar model={model} />}
      <ReportDialog resource={resource} open={model.reporting} onClose={() => model.setReporting(false)} />
    </>
  )
}
