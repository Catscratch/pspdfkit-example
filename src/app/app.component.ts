import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import PSPDFKit, {AnnotationsUnion, Instance} from 'pspdfkit';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{

  @ViewChild('pdfViewer') public pdfViewer: ElementRef | undefined;

  private instance: Instance | undefined;

  constructor(private http: HttpClient) {
  }

  ngOnInit(): void {
    // just to make sure the view child is ready
    setTimeout(() => this.initViewer(), 100);
  }

  private async initViewer() {
    const initialViewState = new PSPDFKit.ViewState({
      readOnly: true
    });

    PSPDFKit.load({
      XFDF: await this.getXFDF(),
      baseUrl: this.assetUrl,
      document: 'assets/example.pdf',
      container: this.pdfViewer?.nativeElement,
      initialViewState: initialViewState
    }).then(instance => this.instance = instance);
  }

  private async getXFDF() {
    const blob = await firstValueFrom(
      this.http.get(this.assetUrl+'annotations.xfdf', {
        responseType: 'blob'
      })
    );
    return await  blob.text();
  }

  private get assetUrl() {
    return location.protocol + '//' + location.host + '/assets/';
  }

  async show(show: boolean) {
    const annotations = await this.instance?.getAnnotations(0);
    const annotation = annotations?.first() as AnnotationsUnion | undefined;
    if(annotation) {
      this.instance?.update(annotation.set('noView', !show));
    }
  }

}
