import { AfterViewInit, Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { PlantPopupComponent } from './plant-popup/plant-popup.component';
import { NavIconsService } from '../services/nav-icons.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-plant-specimens',
  templateUrl: './plant-specimens.component.html',
  styleUrls: ['./plant-specimens.component.scss']
})
export class PlantSpecimensComponent implements AfterViewInit {
  navItems: any[] = [];
  @ViewChildren('slider') sliders!: QueryList<ElementRef<HTMLDivElement>>;

  private intervalIds: any[] = [];

  constructor(private plantSpecimensService: NavIconsService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.plantSpecimensService.getPlantSpecimens().subscribe(data => {
      this.navItems = data;
    });
  }

  ngAfterViewInit(): void {
    this.sliders.forEach((slider, index) => {
      const track = slider.nativeElement.querySelector("[data-slider-track]") as HTMLElement;
      const prev = slider.nativeElement.querySelector("[data-slider-prev]") as HTMLElement;
      const next = slider.nativeElement.querySelector("[data-slider-next]") as HTMLElement;

      if (track && prev && next) {
        this.updateButtonVisibility(track, prev, next);

        prev.addEventListener("click", () => {
          clearInterval(this.intervalIds[index]);
          this.scrollSlider(track, -1);
        });

        next.addEventListener("click", () => {
          clearInterval(this.intervalIds[index]);
          this.scrollSlider(track, 1);
        });

        track.addEventListener("scroll", () => {
          this.updateButtonVisibility(track, prev, next);
        });

        this.intervalIds[index] = setInterval(() => this.scrollSlider(track, 1), 2000);
      }
    });
  }

  private scrollSlider(track: HTMLElement, direction: number): void {
    track.scrollTo({
      left: track.scrollLeft + direction * ((track.firstElementChild as HTMLElement).offsetWidth || 0),
      behavior: "smooth"
    });
    this.updateButtonVisibility(track);
  }

  private updateButtonVisibility(track: HTMLElement, prev?: HTMLElement, next?: HTMLElement): void {
    const trackScrollWidth = track.scrollWidth;
    const trackOuterWidth = track.clientWidth;

    if (prev && next) {
      prev.removeAttribute("disabled");
      next.removeAttribute("disabled");
    }

    if (prev && track.scrollLeft <= 0) {
      prev.setAttribute("disabled", "");
    }

    if (next && track.scrollLeft === trackScrollWidth - trackOuterWidth) {
      next.setAttribute("disabled", "");
    }

    if (track.scrollLeft === 0) {
      prev?.classList.add('hide-arrow');
    } else {
      prev?.classList.remove('hide-arrow');
    }

    if (track.scrollLeft === trackScrollWidth - trackOuterWidth) {
      next?.classList.add('hide-arrow');
    } else {
      next?.classList.remove('hide-arrow');
    }
  }

  openPopup(item: any): void {
    this.dialog.open(PlantPopupComponent, {
      data: {
        title: `Plant ${item.id}: ${item['plant-botanical-name']}`,
        content: `Description: ${item.description}`,
        img: item.img,
        'plant-botanical-name': item['plant-botanical-name'],
        'plant-family-name': item['plant-family-name'],
        'plant-common-names': item['plant-common-names'],
        'plant-parts-used': item['plant-parts-used'],
        predominantly: item['predominantly'],
        'product-offered': item['product-offered'],
        uses: item['uses'],
      },
    });
  }
}
